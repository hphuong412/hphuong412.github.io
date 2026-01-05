const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

// ========================================
// LOGIN
// ========================================
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    // Query user with role and department
    const [users] = await pool.query(
      `SELECT
        u.user_id,
        u.username,
        u.password,
        u.email,
        u.full_name,
        u.phone,
        u.employee_id,
        u.position,
        u.avatar,
        u.is_active,
        r.role_name,
        d.department_name
      FROM user u
      LEFT JOIN role r ON u.role_id = r.role_id
      LEFT JOIN department d ON u.department_id = d.department_id
      WHERE u.username = ? AND u.is_active = 1`,
      [username]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = users[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        user_id: user.user_id, 
        username: user.username,
        role_name: user.role_name 
      },
      process.env.JWT_SECRET || 'your_secret_key_here',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    // Remove password from response
    delete user.password;

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// ========================================
// REGISTER (Optional - for future use)
// ========================================
exports.register = async (req, res) => {
  try {
    const { username, password, email, full_name } = req.body;

    if (!username || !password || !email || !full_name) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Check if user exists
    const [existingUsers] = await pool.query(
      'SELECT user_id FROM user WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Username or email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await pool.query(
      `INSERT INTO user (username, password, email, full_name, role_id, is_active) 
       VALUES (?, ?, ?, ?, 2, TRUE)`,
      [username, hashedPassword, email, full_name]
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user_id: result.insertId
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

// ========================================
// GET CURRENT USER
// ========================================
exports.getMe = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const [users] = await pool.query(
      `SELECT
        u.user_id,
        u.username,
        u.email,
        u.full_name,
        u.phone,
        u.employee_id,
        u.position,
        u.avatar,
        r.role_name,
        d.department_name
      FROM user u
      LEFT JOIN role r ON u.role_id = r.role_id
      LEFT JOIN department d ON u.department_id = d.department_id
      WHERE u.user_id = ?`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: users[0]
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user',
      error: error.message
    });
  }
};

// ========================================
// UPDATE PROFILE
// ========================================
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { full_name, email, phone, position, avatar } = req.body;

    await pool.query(
      `UPDATE user 
       SET full_name = ?, email = ?, phone = ?, position = ?, avatar = ?
       WHERE user_id = ?`,
      [full_name, email, phone, position, avatar, userId]
    );

    // Get updated user
    const [users] = await pool.query(
      `SELECT
        u.user_id,
        u.username,
        u.email,
        u.full_name,
        u.phone,
        u.employee_id,
        u.position,
        u.avatar,
        r.role_name,
        d.department_name
      FROM user u
      LEFT JOIN role r ON u.role_id = r.role_id
      LEFT JOIN department d ON u.department_id = d.department_id
      WHERE u.user_id = ?`,
      [userId]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: users[0]
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

// ========================================
// CHANGE PASSWORD
// ========================================
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current and new passwords are required'
      });
    }

    // Get current password
    const [users] = await pool.query(
      'SELECT password FROM user WHERE user_id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, users[0].password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.query(
      'UPDATE user SET password = ? WHERE user_id = ?',
      [hashedPassword, userId]
    );

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message
    });
  }
};