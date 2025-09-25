const { supabase } = require('../config/database');
const { hashPassword } = require('../config/auth');

const getUsers = async (req, res) => {
  try {
    const { school_id } = req.user;
    const { role, program_type } = req.query;

    let query = supabase
      .from('users')
      .select('*')
      .eq('school_id', school_id);

    if (role) query = query.eq('role', role);
    if (program_type) query = query.eq('program_type', program_type);

    const { data: users, error } = await query;

    if (error) throw error;

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const { school_id } = req.user;
    const { email, first_name, last_name, phone, role, program_type } = req.body;

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Generate password
    const defaultPassword = 'student123';
    const hashedPassword = await hashPassword(defaultPassword);

    const { data: user, error } = await supabase
      .from('users')
      .insert([{
        school_id,
        email,
        password_hash: hashedPassword,
        first_name,
        last_name,
        phone,
        role,
        program_type
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      message: 'User created successfully',
      user: { ...user, password: defaultPassword }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { first_name, last_name, phone, role, program_type, status } = req.body;

    const { data: user, error } = await supabase
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

    if (error) throw error;

    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getUsers, createUser, updateUser };