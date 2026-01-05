const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const userController = require('../controllers/userController');

// ALL ADMIN ONLY
router.get('/', protect, authorize('admin'), userController.getUsers);
router.post('/', protect, authorize('admin'), userController.createUser);
router.put('/:userId/role', protect, authorize('admin'), userController.updateUserRole);
router.delete('/:userId', protect, authorize('admin'), userController.deleteUser);

module.exports = router;
