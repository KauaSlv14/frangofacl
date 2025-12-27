import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Validar que as variáveis de ambiente existem
if (!SUPABASE_URL) {
  console.error('VITE_SUPABASE_URL não está definida nas variáveis de ambiente');
}

if (!SUPABASE_PUBLISHABLE_KEY) {
  console.error('VITE_SUPABASE_PUBLISHABLE_KEY não está definida nas variáveis de ambiente');
}

// Criar cliente Supabase com valores padrão vazios para evitar crash
// O app mostrará erros de autenticação se as variáveis não existirem
export const supabase = createClient<Database>(
  SUPABASE_URL || '',
  SUPABASE_PUBLISHABLE_KEY || '',
  {
    auth: {
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);