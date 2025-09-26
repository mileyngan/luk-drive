const { supabase } = require('../config/database');
const { hashPassword } = require('../config/auth');

const getUsers = async (req, res) => {
  try {
    console.log('GetUsers - Authenticated user:', req.user); // Debug log
    const { school_id } = req.user; // Get school_id from authenticated user
    const { role, program_type } = req.query;

    console.log('GetUsers - School ID from token:', school_id); // Debug log
    console.log('GetUsers - Query params:', { role, program_type }); // Debug log

    if (!school_id) {
      return res.status(400).json({ error: 'No school_id found in token' });
    }

    let query = supabase
      .from('users')
      .select('*')
      .eq('school_id', school_id); // Filter by user's school

    if (role) {
      query = query.eq('role', role);
      console.log('Filtering by role:', role); // Debug log
    }
    if (program_type) query = query.eq('program_type', program_type);

    const result = await query;
    console.log('Supabase result:', result); // Debug log

    if (result.error) {
      console.error('Supabase query error:', result.error);
      throw result.error;
    }

    console.log('Users fetched from DB:', result.data); // Debug log
    res.json(result.data || []);
  } catch (error) {
    console.error('GetUsers error:', error);
    res.status(500).json({ error: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    console.log('CreateUser - Authenticated user:', req.user); // Debug log
    const { school_id } = req.user; // Get school_id from authenticated user
    const { email, first_name, last_name, phone, role, program_type } = req.body;

    console.log('CreateUser - School ID from token:', school_id); // Debug log
    console.log('CreateUser - Data received:', { email, first_name, last_name, phone, role, program_type }); // Debug log

    if (!school_id) {
      return res.status(400).json({ error: 'No school_id found in token' });
    }

    // Check if user exists
    const checkResult = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (checkResult.data) {
      console.log('User already exists:', email); // Debug log
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Generate password
    const defaultPassword = 'student123';
    const hashedPassword = await hashPassword(defaultPassword);

    const insertResult = await supabase
      .from('users')
      .insert([{
        school_id,
        email,
        password_hash: hashedPassword,
        first_name,
        last_name,
        phone,
        role: role || 'student',
        program_type
      }])
      .select()
      .single();

    if (insertResult.error) {
      console.error('User creation error:', insertResult.error);
      throw insertResult.error;
    }

    console.log('User created successfully:', insertResult.data); // Debug log
    res.status(201).json({
      message: 'User created successfully',
      user: { ...insertResult.data, password: defaultPassword }
    });

  } catch (error) {
    console.error('User creation error:', error);
    res.status(500).json({ error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { first_name, last_name, phone, role, program_type, status } = req.body;

    const result = await supabase
      .from('users')
      .update({
        first_name,
        last_name,
        phone,
        role,
        program_type,
        status
      })
      .eq('id', userId)
      .select()
      .single();

    if (result.error) throw result.error;

    res.json({ message: 'User updated successfully', user: result.data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getUsers, createUser, updateUser };