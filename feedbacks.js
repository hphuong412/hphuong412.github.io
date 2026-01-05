const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { protect } = require('../middleware/auth');  // ✅ đúng

router.get('/course/:courseId', feedbackController.getFeedbacksByCourse);
router.post('/course/:courseId', protect, feedbackController.addFeedback); // ✅ protect là function

module.exports = router;
