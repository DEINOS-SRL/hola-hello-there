import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ezchqajzxaeepwqqzmyr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6Y2hxYWp6eGFlZXB3cXF6bXlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2MTU4NTAsImV4cCI6MjA4MjE5MTg1MH0.1ArbKx0dJqrnizjGg96pfjV_vKiM8GlKI-r15KMBhLo';

export const comClient = createClient(supabaseUrl, supabaseKey, {
  db: { schema: 'com' },
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
