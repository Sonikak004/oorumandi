import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hzhcgaxedyelhkllgpqy.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6aGNnYXhlZHllbGhrbGxncHF5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzgyODU2OSwiZXhwIjoyMTAzNDA0NTY5fQ.K3NqWlhNR9mEg8YhMCvPGSI-xltTcNw4HGMQDq8CCB8';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fix() {
  const { data: users, error } = await supabase.auth.admin.listUsers();
  
  if (error) {
    console.error('Error fetching users:', error);
    return;
  }
  
  for (const user of users.users) {
    console.log(`Fixing profile for ${user.email} (${user.id})`);
    const role = user.email === 'admin@oorumandi.com' ? 'ADMIN' : 'VENDOR';
    
    await supabase.from('profiles').upsert({
      id: user.id,
      email: user.email,
      role: role
    });
    
    if (role === 'VENDOR') {
      const branches = ['Bangalore Central', 'Mysore Road', 'Indiranagar'];
      for (const name of branches) {
        await supabase.from('branches').insert({ name, vendor_id: user.id }).select();
      }
    }
  }
  
  console.log('Done fixing profiles and branches.');
}

fix();
