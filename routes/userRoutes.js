const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
// วางบรรทัดนี้ไว้เหนือ router.get('/:id', ...)
router.put('/update-profile', authMiddleware.verifyToken, userController.updateProfile);
// เรียกใช้ authMiddleware.verifyToken คั่นกลางก่อนเข้าถึงข้อมูล (เกณฑ์ข้อ 6.10)
router.get('/:id', authMiddleware.verifyToken, userController.getUserById);

module.exports = router;