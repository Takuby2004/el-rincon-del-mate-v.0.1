import { prisma } from '../config/prisma';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '../config/supabase';
import { env } from '../config/env';
import { AppError } from '../errors/AppError';

export interface UpdateProfileInput {
  email?: string;
  password?: string;
  name?: string;
  phone?: string;
  address?: string;
  ciNit?: string;
}

export class ProfileService {
  public static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
        clientProfile: true
      }
    });
    if (!user) throw AppError.notFound('Usuario no encontrado');
    return user;
  }

  public static async updateProfile(userId: string, data: UpdateProfileInput) {
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });
    if (!existingUser) throw AppError.notFound('Usuario no encontrado');

    const updateData: any = {};
    const supabaseUpdates: { email?: string; password?: string; email_confirm?: boolean } = {};

    // 1. Validación y preparación del nuevo correo electrónico
    if (data.email && data.email.trim().toLowerCase() !== existingUser.email.toLowerCase()) {
      const normalizedEmail = data.email.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(normalizedEmail)) {
        throw AppError.badRequest('El formato del correo electrónico ingresado no es válido.');
      }

      // Validar que no pertenezca a otro usuario en la base de datos
      const emailInUse = await prisma.user.findUnique({
        where: { email: normalizedEmail }
      });
      if (emailInUse && emailInUse.id !== userId) {
        throw AppError.conflict('El correo electrónico ya está registrado por otro usuario.');
      }

      updateData.email = normalizedEmail;
      supabaseUpdates.email = normalizedEmail;
      supabaseUpdates.email_confirm = true; // Auto-confirmación instantánea sin fricción
    }

    // 2. Validación y preparación de la nueva contraseña
    if (data.password && data.password.trim() !== '') {
      if (data.password.length < 6) {
        throw AppError.badRequest('La nueva contraseña debe tener al menos 6 caracteres.');
      }
      updateData.password = await bcrypt.hash(data.password, 10);
      supabaseUpdates.password = data.password;
    }

    // 3. Otros campos de perfil
    if (data.name) updateData.name = data.name.trim();
    if (data.phone !== undefined) updateData.phone = data.phone;

    // 4. Sincronización atómica con Supabase Auth si cambió correo o contraseña
    const isCloudConfigured = Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);
    const hasAuthChanges = Object.keys(supabaseUpdates).length > 0;

    if (hasAuthChanges && isCloudConfigured) {
      try {
        let supabaseUser: any = null;
        let page = 1;
        const perPage = 100;

        while (!supabaseUser) {
          const { data: pageData, error: listError } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
          if (listError) {
            console.error('[ProfileService] Error al listar usuarios en Supabase Auth:', listError);
            throw AppError.internal(`Error al consultar usuarios en Supabase Auth: ${listError.message}`);
          }
          const users = pageData?.users || [];
          supabaseUser = users.find(
            (u) => u.email?.toLowerCase() === existingUser.email.toLowerCase()
          );
          if (users.length < perPage) break;
          page++;
        }

        if (supabaseUser) {
          const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            supabaseUser.id,
            supabaseUpdates
          );
          if (updateError) {
            console.error('[ProfileService] Error al actualizar credenciales en Supabase Auth:', updateError);
            throw AppError.badRequest(
              `Error al sincronizar credenciales con Supabase Auth: ${updateError.message}`
            );
          }
          console.log(`[ProfileService] Credenciales sincronizadas con éxito en Supabase Auth para UID: ${supabaseUser.id}`);
        } else {
          // El usuario no existe en Supabase Auth: abortar con error explícito sin contraseñas fijas
          console.error(`[ProfileService] Cuenta no localizada en Supabase Auth para: ${existingUser.email}`);
          throw AppError.notFound(
            'No se encontró la cuenta correspondiente en Supabase Auth para sincronizar las credenciales. Verifique su sesión o comuníquese con soporte.'
          );
        }
      } catch (err: any) {
        if (err instanceof AppError) throw err;
        console.error('[ProfileService] Excepción de conexión con Supabase Auth:', err);
        throw AppError.internal(`Error de conexión al sincronizar con Supabase Auth: ${err?.message || err}`);
      }
    }

    // 5. Actualización en la base de datos de PostgreSQL
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, email: true, name: true, phone: true, role: true, clientProfile: true }
    });

    // 6. Si tiene perfil de cliente asociado, sincronizarlo
    if (updatedUser.clientProfile) {
      await prisma.client.update({
        where: { id: updatedUser.clientProfile.id },
        data: {
          name: data.name || updatedUser.name,
          email: updatedUser.email,
          phone: data.phone ?? updatedUser.clientProfile.phone,
          address: data.address ?? updatedUser.clientProfile.address,
          ciNit: data.ciNit ?? updatedUser.clientProfile.ciNit
        }
      });
    }

    return this.getProfile(userId);
  }
}
