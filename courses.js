const express = require('express');
const router = express.Router();

const {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollCourse
} = require('../controllers/courseController');

const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getCourses);

// Protected routes (require login + admin role)
router.post('/', protect, authorize('admin'), createCourse);
router.put('/:id', protect, authorize('admin'), updateCourse);
router.delete('/:id', protect, authorize('admin'), deleteCourse);

// Enroll course (any logged-in user)
router.post('/:id/enroll', protect, enrollCourse);

module.exports = router;