const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');

/**
 * GET chapters theo course
 */
exports.getChaptersByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const [rows] = await pool.query(
      `SELECT
        content_id,
        course_id,
        content_title,
        content_description,
        content_type,
        duration,
        video_url,
        content_text,
        order_number
      FROM course_content
      WHERE course_id = ?
      ORDER BY order_number ASC`,
      [courseId]
    );

    res.json(rows);
  } catch (err) {
    console.error('❌ Get chapters error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * CREATE chapter (nhận video_url đã upload sẵn)
 */
exports.createChapter = async (req, res) => {
  try {
    const { courseId } = req.params;
    const {
      content_title,
      content_description,
      content_type,
      duration,
      order_number,
      video_url,  // ← Nhận từ frontend (đã upload qua /api/upload/video)
      content_text
    } = req.body;

    console.log('📥 Create chapter data:', {
      courseId,
      content_title,
      video_url,
      duration
    });

    // Validation
    if (!content_title || !duration) {
      return res.status(400).json({ 
        message: 'Missing required fields: content_title, duration' 
      });
    }

    // Insert vào DB
    const [result] = await pool.query(
      `INSERT INTO course_content
      (course_id, content_title, content_description, content_type,
       duration, order_number, video_url, content_text)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        courseId,
        content_title,
        content_description || '',
        content_type || 'video',
        duration,
        order_number || 1,
        video_url || '',
        content_text || ''
      ]
    );

    console.log('✅ Chapter created:', result.insertId);

    // Trả về data đầy đủ
    res.status(201).json({
      success: true,
      content_id: result.insertId,
      content_title,
      content_description: content_description || '',
      content_type: content_type || 'video',
      duration,
      order_number: order_number || 1,
      video_url: video_url || '',
      content_text: content_text || ''
    });
  } catch (err) {
    console.error('❌ Create chapter error:', err);
    res.status(500).json({ 
      message: 'Server error',
      error: err.message 
    });
  }
};

/**
 * UPDATE chapter
 */
exports.updateChapter = async (req, res) => {
  try {
    const { contentId } = req.params;
    const {
      content_title,
      content_description,
      duration,
      order_number,
      video_url,  // ← Có thể gửi URL mới nếu đổi video
      content_text
    } = req.body;

    console.log('📝 Update chapter:', contentId);

    // Check chapter exists
    const [rows] = await pool.query(
      'SELECT video_url FROM course_content WHERE content_id = ?',
      [contentId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Chapter không tồn tại' });
    }

    let finalVideoUrl = rows[0].video_url;

    // Nếu có video_url mới → xóa video cũ
    if (video_url && video_url !== finalVideoUrl) {
      const oldPath = path.join(__dirname, '..', finalVideoUrl);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
        console.log('🗑️  Deleted old video:', oldPath);
      }
      finalVideoUrl = video_url;
    }

    // Update DB
    await pool.query(
      `UPDATE course_content
       SET content_title = ?,
           content_description = ?,
           duration = ?,
           order_number = ?,
           content_text = ?,
           video_url = ?
       WHERE content_id = ?`,
      [
        content_title,
        content_description || '',
        duration,
        order_number || 1,
        content_text || '',
        finalVideoUrl,
        contentId
      ]
    );

    console.log('✅ Chapter updated:', contentId);

    res.json({
      success: true,
      message: 'Cập nhật chapter thành công',
      content_id: contentId,
      video_url: finalVideoUrl
    });
  } catch (err) {
    console.error('❌ Update chapter error:', err);
    res.status(500).json({ 
      message: 'Server error',
      error: err.message 
    });
  }
};

/**
 * DELETE chapter + delete video file
 */
exports.deleteChapter = async (req, res) => {
  try {
    const { contentId } = req.params;

    console.log('🗑️  Delete chapter:', contentId);

    // Get video URL
    const [rows] = await pool.query(
      'SELECT video_url FROM course_content WHERE content_id = ?',
      [contentId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Chapter không tồn tại' });
    }

    const videoUrl = rows[0].video_url;

    // Delete from DB
    await pool.query(
      'DELETE FROM course_content WHERE content_id = ?',
      [contentId]
    );

    // Delete video file
    if (videoUrl) {
      const videoPath = path.join(__dirname, '..', videoUrl);
      if (fs.existsSync(videoPath)) {
        fs.unlinkSync(videoPath);
        console.log('✅ Video file deleted:', videoPath);
      }
    }

    console.log('✅ Chapter deleted:', contentId);

    res.json({
      success: true,
      message: 'Xóa chapter & video thành công'
    });
  } catch (err) {
    console.error('❌ Delete chapter error:', err);
    res.status(500).json({ 
      message: 'Server error',
      error: err.message 
    });
  }
};