// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://prwxgfoppqfuiyuljort.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByd3hnZm9wcHFmdWl5dWxqb3J0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwNDcwNzIsImV4cCI6MjA2NzYyMzA3Mn0.wruhKLRYbcwMEFzpg6Ux3E360oMp-oAjMjBJ5_1KBXA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);