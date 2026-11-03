const multer = require('multer');
const path = require('path');

// ตั้งค่าที่เก็บไฟล์และชื่อไฟล์
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // โฟลเดอร์ที่เราสร้างไว้
    },
    filename: function (req, file, cb) {
        // ตั้งชื่อไฟล์ใหม่โดยใส่ timestamp ป้องกันชื่อซ้ำ
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});

const upload = multer({ storage: storage });

// Middleware สำหรับรับไฟล์ (ตั้งชื่อ field ว่า 'document')
exports.uploadMiddleware = upload.single('document');

// API Logic
exports.uploadFile = (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ status: 'error', message: 'กรุณาเลือกไฟล์เพื่ออัปโหลด' });
        }
        
        // ส่ง Response กลับไปพร้อม path ของไฟล์
        res.status(200).json({
            status: 'success',
            message: 'อัปโหลดไฟล์สำเร็จ',
            data: {
                filePath: req.file.path
            }
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'เกิดข้อผิดพลาดในการอัปโหลด', error: error.message });
    }
};