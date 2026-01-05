const express = require('express');
const router = express.Router();
const {
  getDocuments,
  getPendingDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
  approveDocument,
  rejectDocument,
  getDocumentComments,      // ← Thêm
  addDocumentComment,       // ← Thêm
  deleteDocumentComment     // ← Thêm
} = require('../controllers/documentController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getDocuments);

// Protected routes (require login)
router.post('/', protect, createDocument);
router.put('/:id', protect, updateDocument);
router.delete('/:id', protect, deleteDocument);

// Admin only routes
router.get('/admin/pending', protect, authorize('admin'), getPendingDocuments);
router.put('/:id/approve', protect, authorize('admin'), approveDocument);
router.put('/:id/reject', protect, authorize('admin'), rejectDocument);

// Comment routes
router.get('/:id/comments', getDocumentComments);
router.post('/:id/comments', protect, addDocumentComment);
router.delete('/:id/comments/:commentId', protect, deleteDocumentComment);

module.exports = router;