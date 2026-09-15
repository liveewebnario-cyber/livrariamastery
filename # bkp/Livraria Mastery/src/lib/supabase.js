import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mhajqbhykwejmkowhxdz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oYWpxYmh5a3dlam1rb3doeGR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1NTQ1ODksImV4cCI6MjA4NzEzMDU4OX0.JkLvLyEMuwT_zSPavbTmafq33T2DDTl4VLiTKkjVCog';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
