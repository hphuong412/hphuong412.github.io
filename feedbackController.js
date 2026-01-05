const { pool } = require('../config/database');

// ===============================
// GET feedback theo COURSE
// ===============================
exports.getFeedbacksByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const [rows] = await pool.query(
      `SELECT f.id, f.rating, f.content, f.created_at,
              u.full_name
       FROM feedbacks f
       JOIN user u ON u.user_id = f.user_id
       WHERE f.course_id = ?
       ORDER BY f.created_at DESC`,
      [courseId]
    );

    res.json(rows);
  } catch (err) {
    console.error('❌ getFeedbacksByCourse error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ===============================
// POST feedback cho COURSE
// ===============================
exports.addFeedback = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { content, rating } = req.body;
    const userId = req.user.user_id;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Feedback content is required' });
    }

    const r = Number(rating);
    if (!Number.isInteger(r) || r < 1 || r > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    await pool.query(
      `INSERT INTO feedbacks (course_id, user_id, content, rating)
       VALUES (?, ?, ?, ?)`,
      [courseId, userId, content.trim(), r]
    );

    res.status(201).json({ success: true });
  } catch (err) {
    console.error('❌ addFeedback error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
