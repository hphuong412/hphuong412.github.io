const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ===== SỬA: Dùng đường dẫn tuyệt đối =====
const uploadDir = path.join(__dirname, '../uploads/videos');

// Tạo thư mục uploads nếu chưa có
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('✅ Created upload directory:', uploadDir);
} else {
  console.log('📁 Upload directory exists:', uploadDir);
}

// Cấu hình multer để lưu video
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('📁 Saving video to:', uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = uniqueName + ext;
    console.log('💾 Generated filename:', filename);
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp4|avi|mov|wmv|flv|mkv/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      console.log('✅ File type accepted:', file.originalname);
      return cb(null, true);
    } else {
      console.log('❌ File type rejected:', file.originalname);
      cb(new Error('Only video files are allowed!'));
    }
  }
});

// POST /api/upload/video
router.post('/video', upload.single('video'), (req, res) => {
  try {
    if (!req.file) {
      console.log('❌ No file in request');
      return res.status(400).json({ message: 'No video file uploaded' });
    }

    const videoUrl = `/uploads/videos/${req.file.filename}`;
    
    console.log('✅ Video uploaded successfully!');
    console.log('   - Filename:', req.file.filename);
    console.log('   - Size:', (req.file.size / 1024 / 1024).toFixed(2), 'MB');
    console.log('   - Saved to:', req.file.path);
    console.log('   - URL:', videoUrl);
    
    res.status(200).json({
      message: 'Video uploaded successfully',
      videoUrl: videoUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ message: 'Failed to upload video', error: error.message });
  }
});

module.exports = router;
