import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cmepdebwntnianknhkgm.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtZXBkZWJ3bnRuaWFua25oa2dtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MTE1OTYsImV4cCI6MjA3NTQ4NzU5Nn0.16SqedZ32zQOlzKSFxYOHqNKeIbwbRm-DGCwCFmljigjust'

// Validate JWT format
const isValidJWT = (token: string) => {
  const parts = token.split('.');
  return parts.length === 3 && parts.every(part => part.length > 0);
};

if (!isValidJWT(supabaseAnonKey)) {
  console.error('❌ Invalid JWT format for Supabase anon key!');
  console.error('Key parts:', supabaseAnonKey.split('.').map((part, i) => `Part ${i + 1}: ${part.length} chars`));
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// For client-side usage
export const createSPAClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  })
}

// For server-side usage (API routes)
export const createServerClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  })
}