import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hzhcgaxedyelhkllgpqy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6aGNnYXhlZHllbGhrbGxncHF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4Mjg1NjksImV4cCI6MjEwMzQwNDU2OX0.lPYRG74yaXYUjyUlj-u4YKzG95zUAVpLzjRWAPOdhDg';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'vendor@oorumandi.com',
    password: 'password123'
  });
  
  if (error) {
    console.log('Login error:', error);
    return;
  }
  
  const { data: profile, error: pError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single();
    
  console.log('Profile fetch error:', pError);
  console.log('Profile data:', profile);
}

test();
