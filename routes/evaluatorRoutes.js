const express = require('express');
const router = express.Router();
const evaluatorController = require('../controllers/evaluatorController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/evaluations/:id/submit', authMiddleware.verifyToken, evaluatorController.submitEvaluation);

module.exports = router;