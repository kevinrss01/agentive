import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase.types';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ROLE_KEY = process.env.SUPABASE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ROLE_KEY) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
