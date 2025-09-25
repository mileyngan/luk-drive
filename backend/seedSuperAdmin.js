// seedSuperAdmin.js
require('dotenv').config();
const bcrypt = require('bcryptjs');
const supabase = require('./src/utils/supabase');

(async () => {
  try {
    const hashedPassword = await bcrypt.hash('SuperAdmin123!', 12);

    const { error } = await supabase.from('users').insert([{
      email: 'superadmin@smartdrive.com',
      password_hash: hashedPassword,
      first_name: 'Super',
      last_name: 'Admin',
      role: 'super_admin'
    }]);

    if (error) throw error;
    console.log('✅ Superadmin user created successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating superadmin:', err.message);
    process.exit(1);
  }
})();
