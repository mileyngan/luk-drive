const { supabase } = require('../config/database');
const { generateToken, hashPassword, comparePassword } = require('../config/auth');

const registerSchool = async (req, res) => {
  try {
    const { name, email, phone, address, city, region } = req.body;

    console.log('Registering school:', { name, email }); // Debug log

    // Check if school already exists
    const { data: existingSchool, error: checkError } = await supabase
      .from('schools')
      .select('*')
      .eq('email', email)
      .single();

    if (existingSchool) {
      console.log('School already exists:', email); // Debug log
      return res.status(400).json({ error: 'School with this email already exists' });
    }

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means no rows found
      console.log('Check error:', checkError); // Debug log
      throw checkError;
    }

    // Create school - FIXED: Added 'data:' to destructuring
    const { data: school, error: schoolError } = await supabase
      .from('schools')
      .insert([{
        name,
        email,
        phone,
        address,
        city,
        region
      }])
      .select()
      .single();

    if (schoolError) {
      console.log('School creation error:', schoolError); // Debug log
      throw schoolError;
    }

    console.log('School created:', school.id); // Debug log

    // Create admin user
    const adminPassword = 'admin123'; // Auto-generated
    const hashedPassword = await hashPassword(adminPassword);

    // FIXED: Added 'data:' to destructuring
    const { data: admin, error: adminError } = await supabase
      .from('users')
      .insert([{
        school_id: school.id,
        email,
        password_hash: hashedPassword,
        first_name: 'Admin',
        last_name: name,
        role: 'admin'
      }])
      .select()
      .single();

    if (adminError) {
      console.log('Admin creation error:', adminError); // Debug log
      throw adminError;
    }

    console.log('Admin created:', admin.id); // Debug log

    res.status(201).json({
      message: 'School registered successfully',
      school: { id: school.id, name: school.name, email: school.email },
      adminPassword: adminPassword // Include the generated password in response
    });

  } catch (error) {
    console.error('Registration error:', error); // Changed to console.error
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt:', email); // Debug log

    // Get user
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        *,
        school:schools!users_school_id_fkey(*)
      `)
      .eq('email', email)
      .single();

    if (error || !user) {
      console.log('User not found:', error); // Debug log
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if school is approved (for non-super admins)
    if (user.role !== 'super_admin') {
      const { data: school, error: schoolError } = await supabase
        .from('schools')
        .select('*')
        .eq('id', user.school_id)
        .single();

      if (schoolError) {
        console.log('School check error:', schoolError); // Debug log
        throw schoolError;
      }

      if (school.status !== 'approved') {
        console.log('School not approved:', school.status); // Debug log
        return res.status(401).json({ error: 'School not approved' });
      }
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      console.log('Invalid password'); // Debug log
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      school_id: user.school_id
    });

    console.log('Login successful:', user.id); // Debug log

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        school: user.school
      }
    });

  } catch (error) {
    console.error('Login error:', error); // Changed to console.error
    res.status(500).json({ error: error.message });
  }
};

module.exports = { registerSchool, login };