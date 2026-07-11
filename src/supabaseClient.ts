import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

let supabaseInstance: any;

if (supabaseUrl && supabaseUrl.startsWith('https://') && supabaseServiceKey && supabaseServiceKey !== 'your-supabase-service-role-key') {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    });
  } catch (e) {
    console.error('Error initializing Supabase client:', e);
    supabaseInstance = createFallbackProxy();
  }
} else {
  supabaseInstance = createFallbackProxy();
}

function createFallbackProxy() {
  console.warn(
    'WARNING: Running in offline mock mode because SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY are invalid or missing.'
  );
  return new Proxy({} as any, {
    get(target, prop) {
      if (prop === 'auth') {
        return {
          getUser: async () => ({ data: { user: null }, error: new Error('Supabase not configured') }),
          signUp: async () => ({ data: { user: null, session: null }, error: new Error('Supabase not configured') }),
          signInWithPassword: async () => ({ data: { user: null, session: null }, error: new Error('Supabase not configured') }),
        };
      }
      return () => ({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: new Error('Supabase not configured') }),
            order: async () => ({ data: [], error: new Error('Supabase not configured') }),
          }),
          order: async () => ({ data: [], error: new Error('Supabase not configured') }),
        }),
        upsert: async () => ({ error: new Error('Supabase not configured') }),
        insert: async () => ({ error: new Error('Supabase not configured') }),
        delete: () => ({
          eq: () => ({
            eq: async () => ({ error: new Error('Supabase not configured') }),
          }),
        }),
      });
    }
  });
}

export const supabase = supabaseInstance;
