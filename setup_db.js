const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hzhcgaxedyelhkllgpqy.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6aGNnYXhlZHllbGhrbGxncHF5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzgyODU2OSwiZXhwIjoyMTAzNDA0NTY5fQ.K3NqWlhNR9mEg8YhMCvPGSI-xltTcNw4HGMQDq8CCB8';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function main() {
  console.log('Setting up auth users and data...');
  
  // 1. Create Admin User
  let adminId;
  const { data: existingAdminList } = await supabase.auth.admin.listUsers();
  const existingAdmin = existingAdminList.users.find(u => u.email === 'admin@oorumandi.com');
  
  if (existingAdmin) {
    adminId = existingAdmin.id;
    console.log('Admin auth user already exists:', adminId);
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'admin@oorumandi.com',
      password: 'password123',
      email_confirm: true
    });
    if (error) throw error;
    adminId = data.user.id;
    console.log('Created Admin auth user:', adminId);
  }

  // 2. Create Vendor User
  let vendorId;
  const existingVendor = existingAdminList.users.find(u => u.email === 'vendor@oorumandi.com');
  
  if (existingVendor) {
    vendorId = existingVendor.id;
    console.log('Vendor auth user already exists:', vendorId);
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'vendor@oorumandi.com',
      password: 'password123',
      email_confirm: true
    });
    if (error) throw error;
    vendorId = data.user.id;
    console.log('Created Vendor auth user:', vendorId);
  }

  // 3. Insert into profiles
  const { error: pError } = await supabase.from('profiles').upsert([
    { id: adminId, email: 'admin@oorumandi.com', role: 'ADMIN' },
    { id: vendorId, email: 'vendor@oorumandi.com', role: 'VENDOR' }
  ]);
  if (pError) console.log('Profile insert warning (might already exist):', pError.message);
  else console.log('Profiles updated.');

  // 4. Create branches for vendor
  const branches = ['Bangalore Central', 'Mysore Road', 'Indiranagar'];
  
  // Check if branches exist
  const { data: existingBranches } = await supabase.from('branches').select('name').eq('vendor_id', vendorId);
  const existingBranchNames = existingBranches ? existingBranches.map(b => b.name) : [];
  
  for (const name of branches) {
    if (!existingBranchNames.includes(name)) {
      const { error } = await supabase.from('branches').insert({ name, vendor_id: vendorId });
      if (error) console.log('Error creating branch:', name, error.message);
      else console.log('Created branch:', name);
    }
  }

  console.log('Setup complete!');
}

main().catch(console.error);
