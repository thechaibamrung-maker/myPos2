const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('./config/db'); // เรียกใช้การเชื่อมต่อฐานข้อมูล

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // ให้ API รับข้อมูลเป็น JSON ได้
app.use(express.urlencoded({ extended: true }));

// ทดสอบ Route พื้นฐาน
app.get('/', (req, res) => {
    res.send('Evaluation System API is running...');
});

// กำหนด Port จาก .env หรือใช้ 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});

// นำเข้า Routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const uploadRoutes = require('./routes/uploadRoutes');
app.use('/api/upload', uploadRoutes);

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

const evaluationRoutes = require('./routes/evaluationRoutes');
app.use('/api/evaluations', evaluationRoutes);

const evaluateeRoutes = require('./routes/evaluateeRoutes');
app.use('/api/evaluatee', evaluateeRoutes);

const evaluatorRoutes = require('./routes/evaluatorRoutes');
app.use('/api/evaluator', evaluatorRoutes);