import { createClient } from '@supabase/supabase-js';
import { env } from './env';

const supabaseUrl = env.SUPABASE_URL || 'https://gleylrngndyvxaucxfrf.supabase.co';

// Para auth.signInWithPassword y auth.signUp siempre se requiere la clave anon / publishable
const supabaseAnonKey =
  env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_G6c3Jhy7DL4YBnCIsGWvzw_UMqOWpC7';

const supabaseServiceRoleKey =
  env.SUPABASE_SERVICE_ROLE_KEY ||
  supabaseAnonKey;

/**
 * Cliente de Supabase para operaciones de autenticación de usuarios (login, signup)
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Cliente administrativo de Supabase con service_role para operaciones privilegiadas
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});


