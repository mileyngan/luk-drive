const { supabase } = require('../config/database');
const { generateToken, hashPassword, comparePassword } = require('../config/auth');

const registerSchool = async (req, res) => {
  try {
    const { name, email, phone, address, city, region } = req.body;

    // Check if school already exists
    const { data: existingSchool } = await supabase
      .from('schools')
      .select('*')
      .eq('email', email)
      .single();

    if (existingSchool) {
      return res.status(400).json({ error: 'School with this email already exists' });
    }

    // Create school
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

    if (schoolError) throw schoolError;

    // Create admin user
    const adminPassword = 'admin123'; // Auto-generated
    const hashedPassword = await hashPassword(adminPassword);

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

    if (adminError) throw adminError;

    res.status(201).json({
      message: 'School registered successfully',
      school: { id: school.id, name: school.name, email: school.email }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

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
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if school is approved (for non-super admins)
    if (user.role !== 'super_admin') {
      const { data: school, error: schoolError } = await supabase
        .from('schools')
        .select('*')
        .eq('id', user.school_id)
        .single();

      if (schoolError || school.status !== 'approved') {
        return res.status(401).json({ error: 'School not approved' });
      }
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      school_id: user.school_id
    });

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
    res.status(500).json({ error: error.message });
  }
};

module.exports = { registerSchool, login };