const express = require('express');
const router = express.Router();
const evaluateeController = require('../controllers/evaluateeController');
const authMiddleware = require('../middlewares/authMiddleware');

// Route สำหรับส่งประเมินตนเอง (ต้องมี Token)
router.post('/evaluations/:id/self', authMiddleware.verifyToken, evaluateeController.submitSelfEvaluation);

module.exports = router;