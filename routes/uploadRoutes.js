const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');

// สร้าง API แบบ POST สำหรับอัปโหลดไฟล์
router.post('/', uploadController.uploadMiddleware, uploadController.uploadFile);

module.exports = router;