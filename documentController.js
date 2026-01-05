
const { pool } = require('../config/database');

// Get all approved documents
exports.getDocuments = async (req, res) => {
  try {
    const [documents] = await pool.query(`
      SELECT 
        d.*,
        u.full_name as author_name
      FROM document d
      LEFT JOIN user u ON d.created_by = u.user_id
      WHERE d.status = 'approved'
      ORDER BY d.created_at DESC
    `);

    res.json(documents);
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Error loading documents',
      error: error.message
    });
  }
};

// Get pending documents (Admin only)
exports.getPendingDocuments = async (req, res) => {
  try {
    const [documents] = await pool.query(`
      SELECT 
        d.*,
        u.full_name as author_name
      FROM document d
      LEFT JOIN user u ON d.created_by = u.user_id
      WHERE d.status = 'pending'
      ORDER BY d.created_at DESC
    `);

    res.json(documents);
  } catch (error) {
    console.error('Get pending documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Error loading pending documents',
      error: error.message
    });
  }
};

// Create document
exports.createDocument = async (req, res) => {
  try {
    const { document_name, description, content, category, image } = req.body;
    const userId = req.user.user_id;

    const [result] = await pool.query(
      `INSERT INTO document (document_name, description, content, category, image, created_by, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [document_name, description, content, category, image, userId]
    );

    res.status(201).json({
      success: true,
      message: 'Document created and pending approval',
      document_id: result.insertId
    });
  } catch (error) {
    console.error('Create document error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating document',
      error: error.message
    });
  }
};

// Update document
exports.updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { document_name, description, content, category, image } = req.body;

    await pool.query(
      `UPDATE document 
       SET document_name = ?, description = ?, content = ?, category = ?, image = ?
       WHERE document_id = ?`,
      [document_name, description, content, category, image, id]
    );

    res.json({
      success: true,
      message: 'Document updated successfully'
    });
  } catch (error) {
    console.error('Update document error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating document',
      error: error.message
    });
  }
};

// Delete document
exports.deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query('DELETE FROM document WHERE document_id = ?', [id]);

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting document',
      error: error.message
    });
  }
};

// Approve document (Admin only)
exports.approveDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user?.user_id || 1;

    console.log('📝 Approve document - ID:', id);
    console.log('📝 Admin ID:', adminId);

    const [result] = await pool.query(
      `UPDATE document 
       SET status = 'approved', approved_by = ?, approved_at = NOW()
       WHERE document_id = ?`,
      [adminId, id]
    );

    console.log('✅ Document approved, rows affected:', result.affectedRows);

    res.json({
      success: true,
      message: 'Document approved successfully'
    });
  } catch (error) {
    console.error('❌ Approve document error:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving document',
      error: error.message
    });
  }
};

// Reject document (Admin only)
exports.rejectDocument = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      `UPDATE document 
       SET status = 'rejected'
       WHERE document_id = ?`,
      [id]
    );

    res.json({
      success: true,
      message: 'Document rejected'
    });
  } catch (error) {
    console.error('Reject document error:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting document',
      error: error.message
    });
  }
};

// Get comments for a document
exports.getDocumentComments = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('📝 Getting comments for document:', id);

    const [comments] = await pool.query(`
      SELECT 
        c.comment_id,
        c.content_text,
        c.created_at,
        u.full_name as user_name,
        u.user_id,
        r.role_name
      FROM comment c
      LEFT JOIN user u ON c.user_id = u.user_id
      LEFT JOIN role r ON u.role_id = r.role_id
      WHERE c.document_id = ?
      ORDER BY c.created_at DESC
    `, [id]);

    console.log('✅ Found', comments.length, 'comments');
    res.json(comments);
  } catch (error) {
    console.error('❌ Get comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error loading comments',
      error: error.message
    });
  }
};

// Add comment to document
exports.addDocumentComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content_text } = req.body;
    const userId = req.user.user_id;

    console.log('📝 Adding comment to document:', id);
    console.log('📝 User:', userId, 'Content:', content_text);

    const [result] = await pool.query(
      `INSERT INTO comment (document_id, user_id, content_text, target_type, target_id)
       VALUES (?, ?, ?, 'document', ?)`,
      [id, userId, content_text, id]
    );

    // Get the comment with user info
    const [comments] = await pool.query(`
      SELECT 
        c.comment_id,
        c.content_text,
        c.created_at,
        u.full_name as user_name,
        u.user_id,
        r.role_name
      FROM comment c
      LEFT JOIN user u ON c.user_id = u.user_id
      LEFT JOIN role r ON u.role_id = r.role_id
      WHERE c.comment_id = ?
    `, [result.insertId]);

    console.log('✅ Comment added');

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment: comments[0]
    });
  } catch (error) {
    console.error('❌ Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding comment',
      error: error.message
    });
  }
};

// Delete comment
exports.deleteDocumentComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const userId = req.user.user_id;
    const isAdmin = req.user.role_name === 'admin';

    console.log('📝 Deleting comment:', commentId);

    // Check if user owns the comment or is admin
    const [comments] = await pool.query(
      'SELECT user_id FROM comment WHERE comment_id = ?',
      [commentId]
    );

    if (comments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    if (comments[0].user_id !== userId && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment'
      });
    }

    await pool.query('DELETE FROM comment WHERE comment_id = ?', [commentId]);

    console.log('✅ Comment deleted');

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting comment',
      error: error.message
    });
  }
};
