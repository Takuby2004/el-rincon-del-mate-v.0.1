import { prisma } from '../config/prisma';
import { supabase } from '../config/supabase';
import { AppError } from '../errors/AppError';

export class AuthService {
  /**
   * Registro de clientes delegando credenciales seguras a Supabase Auth
   */
  public static async register(data: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    address?: string;
    ciNit?: string;
  }) {
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      throw AppError.conflict('El correo electrónico ya se encuentra registrado.');
    }

    // Registrar usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          phone: data.phone || ''
        }
      }
    });

    if (authError || !authData.user) {
      throw AppError.badRequest(
        authError?.message || 'No fue posible registrar el usuario en Supabase Auth.'
      );
    }

    // Sincronizar registro y perfil en la base de datos de la tienda
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: 'SUPABASE_AUTH_MANAGED',
        name: data.name,
        phone: data.phone,
        role: 'CLIENT',
        clientProfile: {
          create: {
            name: data.name,
            email: data.email,
            phone: data.phone || '',
            address: data.address || '',
            ciNit: data.ciNit || ''
          }
        }
      },
      include: { clientProfile: true }
    });

    const token = authData.session?.access_token || '';
    return {
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      token
    };
  }

  /**
   * Inicio de sesión autenticado contra la bóveda de Supabase Auth
   */
  public static async login(data: { email: string; password: string }) {
    // 1. Validar correo y contraseña directamente contra Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password
    });

    if (authError || !authData.user || !authData.session) {
      throw AppError.unauthorized('Credenciales inválidas. Verifique su correo y contraseña en Supabase Auth.');
    }

    // 2. Localizar o auto-vincular el perfil en la base de datos de la tienda
    let user = await prisma.user.findUnique({
      where: { email: data.email },
      include: { clientProfile: true }
    });

    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@elrincondelmate.com').toLowerCase();
    const isEmailAdmin = data.email.toLowerCase() === adminEmail;

    if (!user) {
      // Si el usuario fue creado manualmente en Supabase Dashboard, sincronizar perfil localmente:
      user = await prisma.user.create({
        data: {
          email: data.email,
          password: 'SUPABASE_AUTH_MANAGED',
          name: authData.user.user_metadata?.name || (isEmailAdmin ? 'Administrador Dueño' : 'Cliente'),
          role: isEmailAdmin ? 'ADMIN' : 'CLIENT'
        },
        include: { clientProfile: true }
      });
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        clientProfile: user.clientProfile
      },
      token: authData.session.access_token
    };
  }
}
