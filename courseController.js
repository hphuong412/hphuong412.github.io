
const { pool } = require('../config/database');

// ========================================
// GET ALL COURSES (PUBLIC)
// ========================================
exports.getCourses = async (req, res) => {
  try {
    const [courses] = await pool.query(`
      SELECT 
        c.*,
        u.full_name as author_name
      FROM course c
      LEFT JOIN user u ON c.created_by = u.user_id
      WHERE c.status = 'active'
      ORDER BY c.created_at DESC
    `);

    res.json(courses);
  } catch (error) {
    console.error('❌ Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Error loading courses',
      error: error.message
    });
  }
};

// ========================================
// CREATE COURSE (ADMIN ONLY)
// ========================================
exports.createCourse = async (req, res) => {
  try {
    console.log('📝 Create Course - Body:', req.body);
    console.log('📝 Create Course - User:', req.user);
    
    const { course_name, course_code, description, category, author, start_date, image } = req.body;
    const userId = req.user?.user_id || 1;

    console.log('📝 User ID:', userId);

    const [result] = await pool.query(
      `INSERT INTO course (course_code, course_name, description, category, author, start_date, image, created_by, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      [course_code, course_name, description, category, author, start_date, image, userId]
    );

    console.log('✅ Course created with ID:', result.insertId);

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      course_id: result.insertId
    });
  } catch (error) {
    console.error('❌ Create course error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating course',
      error: error.message
    });
  }
};

// ========================================
// UPDATE COURSE (ADMIN ONLY)
// ========================================
exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { course_name, course_code, description, category, author, start_date, image } = req.body;

    console.log('📝 Update course:', id);

    await pool.query(
      `UPDATE course 
       SET course_name = ?, course_code = ?, description = ?, category = ?, author = ?, start_date = ?, image = ?
       WHERE course_id = ?`,
      [course_name, course_code, description, category, author, start_date, image, id]
    );

    console.log('✅ Course updated');

    res.json({
      success: true,
      message: 'Course updated successfully'
    });
  } catch (error) {
    console.error('❌ Update course error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating course',
      error: error.message
    });
  }
};

// ========================================
// DELETE COURSE (ADMIN ONLY)
// ========================================
exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🗑️ Delete course:', id);
    
    await pool.query('DELETE FROM course WHERE course_id = ?', [id]);
    
    console.log('✅ Course deleted');
    
    res.json({ 
      success: true, 
      message: 'Course deleted successfully' 
    });
  } catch (error) {
    console.error('❌ Delete course error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ========================================
// ENROLL IN COURSE (LOGGED-IN USER)
// ========================================
exports.enrollCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;

    console.log('📚 Enroll user', userId, 'in course', id);

    await pool.query(
      `INSERT INTO enrollment (user_id, course_id, status, progress)
       VALUES (?, ?, 'enrolled', 0)
       ON DUPLICATE KEY UPDATE status = 'enrolled'`,
      [userId, id]
    );

    console.log('✅ Enrolled successfully');

    res.json({
      success: true,
      message: 'Enrolled successfully'
    });
  } catch (error) {
    console.error('❌ Enroll error:', error);
    res.status(500).json({
      success: false,
      message: 'Error enrolling in course',
      error: error.message
    });
  }
};
