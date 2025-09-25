// ============ src/routes/auth.js ============
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../utils/supabase');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Register school (B2B registration)
router.post('/register-school', async (req, res) => {
  try {
    const { name, email, phone, address, adminFirstName, adminLastName, adminPhone, password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required for registration' });
    }

    // Check if school already exists
    const { data: existingSchool } = await supabase
      .from('schools')
      .select('email')
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
        status: 'pending'
      }])
      .select()
      .single();

    if (schoolError) {
      throw schoolError;
    }

    // Hash admin password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create admin user
    const { data: admin, error: adminError } = await supabase
      .from('users')
      .insert([{
        school_id: school.id,
        email,
        password_hash: hashedPassword,
        first_name: adminFirstName || 'Admin',
        last_name: adminLastName || 'User',
        phone: adminPhone || '',
        role: 'admin'
      }])
      .select()
      .single();

    if (adminError) {
      throw adminError;
    }

    res.status(201).json({
      message: 'School registered successfully. Awaiting approval.',
      school: {
        id: school.id,
        name: school.name,
        status: school.status
      }
    });

  } catch (error) {
    console.error('School registration error:', error);
    res.status(500).json({ error: 'Failed to register school' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data: user, error } = await supabase
      .from('users')
      .select('*, schools(name, status)')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.role !== 'super_admin' && user.schools?.status !== 'approved') {
      return res.status(401).json({ error: 'School not yet approved' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role, schoolId: user.school_id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        programType: user.program_type,
        school: user.schools
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      email: req.user.email,
      firstName: req.user.first_name,
      lastName: req.user.last_name,
      role: req.user.role,
      programType: req.user.program_type,
      school: req.user.schools
    }
  });
});

// Change password
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const isValidPassword = await bcrypt.compare(currentPassword, req.user.password_hash);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    const { error } = await supabase
      .from('users')
      .update({ password_hash: hashedPassword })
      .eq('id', req.user.id);

    if (error) {
      throw error;
    }

    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

module.exports = router;
