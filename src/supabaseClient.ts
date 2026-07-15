import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || '';

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
    'WARNING: Running in offline mock mode because SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SECRET_KEY) are invalid or missing.'
  );

  const makeMock = (path: string[] = []): any => {
    // Return a function so that the proxy remains callable as well as gettable
    const target = () => {};

    const proxy = new Proxy(target, {
      get(t, prop) {
        const propStr = String(prop);
        if (propStr === 'then') {
          return (resolve: any) => {
            const hasPath = (name: string) => path.includes(name);

            if (hasPath('signUp') || hasPath('signInWithPassword')) {
              resolve({ data: { user: null, session: null }, error: new Error('Supabase not configured') });
            } else if (hasPath('getUser')) {
              resolve({ data: { user: null }, error: new Error('Supabase not configured') });
            } else if (hasPath('single')) {
              resolve({ data: null, error: new Error('Supabase not configured') });
            } else if (hasPath('select') || hasPath('order')) {
              resolve({ data: [], error: new Error('Supabase not configured') });
            } else {
              resolve({ data: null, error: new Error('Supabase not configured') });
            }
          };
        }

        return makeMock([...path, propStr]);
      },
      apply(t, thisArg, argumentsList) {
        return makeMock(path);
      }
    });

    return proxy;
  };

  return makeMock();
}

export const supabase = supabaseInstance;
