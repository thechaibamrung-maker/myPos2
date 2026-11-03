const jwt = require('jsonwebtoken');

// Middleware สำหรับตรวจสอบ JWT Token (ตรงตามเกณฑ์ 6.10)
exports.verifyToken = (req, res, next) => {
    // รับค่า Token จากส่วน Headers
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // แยกเอาเฉพาะตัว Token ออกจากคำว่า "Bearer "

    if (!token) {
        return res.status(401).json({ status: 'error', message: 'ปฏิเสธการเข้าถึง: ไม่พบ Token ตรวจสอบสิทธิ์' });
    }

    // ตรวจสอบความถูกต้องของ Token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ status: 'error', message: 'ปฏิเสธการเข้าถึง: Token ไม่ถูกต้องหรือหมดอายุ' });
        }
        // ถ้าผ่าน ให้แนบข้อมูลผู้ใช้ไปกับ request เพื่อให้ API อื่นๆ นำไปใช้ต่อได้
        req.user = decoded;
        next();
    });
};