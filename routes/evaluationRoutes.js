const express = require('express');
const router = express.Router();
const evaluationController = require('../controllers/evaluationController');
const authMiddleware = require('../middlewares/authMiddleware');

// เรียกใช้ Middleware ตรวจสอบ Token ก่อนเข้าถึง Controller (ข้อ 6.10)[cite: 5]
router.post('/', authMiddleware.verifyToken, evaluationController.createEvaluation);

module.exports = router;
// เพิ่ม Route สำหรับมอบหมายงาน โดยต้องผ่านการตรวจสอบ Token ก่อน
router.post('/:id/assignments', authMiddleware.verifyToken, evaluationController.assignEvaluators);