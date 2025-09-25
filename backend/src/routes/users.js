const express = require('express');
const bcrypt = require('bcryptjs');
const supabase = require('../utils/supabase');
const { authenticateToken, requireRole } = require('../middleware/auth');
const router = express.Router();

// Helper to generate random password
const generateRandomPassword = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// GET users with optional filters
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { role, program_type } = req.query;
    let query = supabase.from('users').select('*').eq('school_id', req.user.school_id);

    if (role) query = query.eq('role', role);
    if (program_type) query = query.eq('program_type', program_type);

    const { data: users, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST create user
router.post('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { email, firstName, lastName, phone, role, programType } = req.body;

    // Generate temporary password
    const temporaryPassword = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(temporaryPassword, 12);

    const { data: newUser, error } = await supabase
      .from('users')
      .insert([{
        school_id: req.user.school_id,
        email,
        first_name: firstName,
        last_name: lastName,
        phone,
        role,
        program_type: programType,
        password_hash: hashedPassword,
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      message: 'User created successfully',
      user: newUser,
      temporaryPassword
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// PUT update user
router.put('/:userId', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { userId } = req.params;
    const { firstName, lastName, phone, role, programType } = req.body;

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({
        first_name: firstName,
        last_name: lastName,
        phone,
        role,
        program_type: programType,
      })
      .eq('id', userId)
      .eq('school_id', req.user.school_id)
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE user
router.delete('/:userId', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { userId } = req.params;
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)
      .eq('school_id', req.user.school_id);

    if (error) throw error;
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// POST reset password
router.post('/:userId/reset-password', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { userId } = req.params;

    // Generate temporary password
    const temporaryPassword = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(temporaryPassword, 12);

    const { data: user, error } = await supabase
      .from('users')
      .update({ password_hash: hashedPassword })
      .eq('id', userId)
      .eq('school_id', req.user.school_id)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'Password reset successfully', temporaryPassword });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

module.exports = router;
