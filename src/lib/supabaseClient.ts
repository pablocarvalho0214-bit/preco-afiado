import { createClient } from '@supabase/supabase-js';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://shmlgxvhfzyxxuhevtou.supabase.co';
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNobWxneHZoZnp5eHh1aGV2dG91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMDY5ODUsImV4cCI6MjA4NzY4Mjk4NX0.25x9Ah3_t91lQypCVwgwAmZ1l1tSocAwDE3icF5wJ6U';

const supabaseUrl = rawUrl.trim();
const supabaseAnonKey = rawKey.trim();

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
    }
});
