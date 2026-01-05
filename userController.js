const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');
// GET all users (admin)
// GET all users (admin)
exports.getUsers = async (req, res) => {
  try {
    const [users] = await pool.query(`
      SELECT
        u.user_id,
        u.full_name,
        u.email,
        u.username,
        u.employee_id,
        u.department_id,
        d.department_name,
        u.position,
        r.role_name,
        u.created_at,
        u.is_active
      FROM user u
      LEFT JOIN role r ON u.role_id = r.role_id
      LEFT JOIN department d ON u.department_id = d.department_id
      ORDER BY u.created_at DESC
    `);

    return res.json(users);
  } catch (error) {
    console.error('❌ Get users error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// CREATE user (admin)
exports.createUser = async (req, res) => {
  try {
    const {
      full_name,
      email,
      username,
      password,
      employee_id,
      department, // frontend đang gửi department
      position,
      role, // optional (admin/staff/user)
    } = req.body;

    // role -> role_id
    const roleIdMap = { admin: 1, user: 2, staff: 3 };
    const role_id = roleIdMap[String(role || 'user').toLowerCase()] || 2;

    // department có thể là id (số) hoặc tên => mình xử cả 2
    let department_id = null;

    if (department !== undefined && department !== null && String(department).trim() !== '') {
      if (!Number.isNaN(Number(department))) {
        department_id = Number(department);
      } else {
        // nếu gửi department name => tìm id
        const [deps] = await pool.query(
          'SELECT department_id FROM department WHERE department_name = ? LIMIT 1',
          [String(department)]
        );
        department_id = deps[0]?.department_id ?? null;
      }
    }

    // Check username exists
    const [existing] = await pool.query(
      'SELECT user_id FROM user WHERE username = ? LIMIT 1',
      [username]
    );
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Username already exists' });
    }

    // Hash password -> lưu vào cột `password`
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const [result] = await pool.query(
      `INSERT INTO user (full_name, email, username, password, role_id, employee_id, department_id, position, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [full_name, email, username, hashed, role_id, employee_id, department_id, position]
    );

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      user_id: result.insertId
    });
  } catch (error) {
    console.error('❌ Create user error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE user role (admin)
exports.updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    const roleIdMap = { admin: 1, user: 2, staff: 3 };
    const role_id = roleIdMap[String(role || '').toLowerCase()];

    if (!role_id) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    // Không cho tự hạ admin nếu muốn (tuỳ em)
    // if (Number(userId) === req.user.user_id && role_id !== 1) { ... }

    await pool.query('UPDATE user SET role_id = ? WHERE user_id = ?', [role_id, userId]);

    return res.json({ success: true, message: 'Role updated successfully' });
  } catch (error) {
    console.error('❌ Update role error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE user (admin)
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const [user] = await pool.query(
      'SELECT role_id FROM user WHERE user_id = ? LIMIT 1',
      [userId]
    );

    if (!user.length) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user[0].role_id === 1) {
      return res.status(403).json({ success: false, message: 'Cannot delete admin user' });
    }

    await pool.query('DELETE FROM user WHERE user_id = ?', [userId]);

    return res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('❌ Delete user error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};
