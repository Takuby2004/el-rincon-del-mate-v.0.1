import { createClient } from '@supabase/supabase-js';
import { env } from './env';

const supabaseUrl = env.SUPABASE_URL || 'https://gleylrngndyvxaucxfrf.supabase.co';
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY || 'sb_publishable_G6c3Jhy7DL4YBnCIsGWvzw_UMqOWpC7';

/**
 * Cliente de Supabase para operaciones del servidor (Autenticación y Storage)
 */
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

