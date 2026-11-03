const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// สร้าง API แบบ POST[cite: 5]
router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;