const db = require('../config/db');

// @description ดึงข้อมูลผู้ใช้งานด้วย ID
// @route       GET /api/users/:id
// @parameters  id (Path Parameter) ตรงตามเกณฑ์ 6.1 และ 6.8
exports.getUserById = async (req, res) => {
    try {
        const userId = req.params.id; // รับค่าแบบ Path Parameter
        
        // ค้นหาข้อมูลใน Database
        const [users] = await db.query('SELECT id, username, role FROM users WHERE id = ?', [userId]);
        
        if (users.length === 0) {
            return res.status(404).json({ status: 'error', message: 'ไม่พบข้อมูลผู้ใช้' });
        }

        res.status(200).json({
            status: 'success',
            message: 'ดึงข้อมูลสำเร็จ',
            data: users[0]
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'เกิดข้อผิดพลาด', error: error.message });
    }
};

// API สำหรับแก้ไขข้อมูลส่วนตัวเบื้องต้น (เกณฑ์ 5.2.2)[cite: 6]
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id; // ดึง ID มาจาก Token เลย ปลอดภัยกว่า
        const { first_name, last_name, department } = req.body;

        await db.query(
            'UPDATE users SET first_name = ?, last_name = ?, department = ? WHERE id = ?',
            [first_name, last_name, department, userId]
        );

        res.status(200).json({
            status: 'success',
            message: 'อัปเดตข้อมูลส่วนตัวสำเร็จ'
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'เกิดข้อผิดพลาด', error: error.message });
    }
};