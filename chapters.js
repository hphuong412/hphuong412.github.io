const express = require('express');
const router = express.Router();
const chapterController = require('../controllers/chapterController');

// GET chapters by course
router.get(
  '/course/:courseId',
  chapterController.getChaptersByCourse
);

// CREATE chapter
router.post(
  '/course/:courseId',

  chapterController.createChapter
);

// UPDATE chapter
router.put(
  '/:contentId',

  chapterController.updateChapter
);

// DELETE chapter
router.delete(
  '/:contentId',
  chapterController.deleteChapter
);

module.exports = router;

