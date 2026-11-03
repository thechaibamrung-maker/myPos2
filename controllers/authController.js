const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// API สร้าง User ทดสอบ
exports.register = async (req, res) => {
    try {
        const { username, password, role } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10); // เข้ารหัสผ่าน
        await db.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hashedPassword, role]);
        res.status(201).json({ status: 'success', message: 'สร้างผู้ใช้สำเร็จ' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'เกิดข้อผิดพลาด', error: error.message });
    }
};

// API เข้าสู่ระบบ (Login)
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Exception Handling: ตรวจสอบข้อมูลว่างเปล่า[cite: 5]
        if (!username || !password) {
            return res.status(400).json({ status: 'error', message: 'กรุณากรอก Username และ Password' });
        }

        const [users] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        const user = users[0];

        // Exception Handling: ไม่พบผู้ใช้[cite: 5]
        if (!user) {
            return res.status(404).json({ status: 'error', message: 'ไม่พบผู้ใช้งานนี้ในระบบ' });
        }

        // ตรวจสอบรหัสผ่าน
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ status: 'error', message: 'รหัสผ่านไม่ถูกต้อง' });
        }

        // สร้าง JWT Token[cite: 5]
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        // ส่ง Response กลับไปในรูปแบบ JSON ที่มี status, message, data อย่างเป็นระบบ[cite: 5]
        res.status(200).json({
            status: 'success',
            message: 'เข้าสู่ระบบสำเร็จ',
            data: {
                token: token,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({ status: 'error', message: 'เกิดข้อผิดพลาดที่ Server', error: error.message });
    }
};