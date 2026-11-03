const db = require('../config/db');

// API สำหรับผู้ถูกประเมินส่งผลการประเมินตนเอง (เกณฑ์ 5.2.3, 5.2.4, 5.2.5)[cite: 6]
exports.submitSelfEvaluation = async (req, res) => {
    try {
        const evaluatee_id = req.user.id;
        const evaluation_id = req.params.id; // รับ ID ของฟอร์มประเมิน
        const { scores } = req.body; 
        // รูปแบบที่จะส่งมา: [{ indicator_id: 1, self_info: "ทำงานเสร็จตรงเวลา", self_score: 4 }]

        // ตรวจสอบว่าเป็น Role: evaluatee เท่านั้น
        if (req.user.role !== 'evaluatee') {
            return res.status(403).json({ status: 'error', message: 'เฉพาะผู้รับการประเมินเท่านั้นที่ทำรายการนี้ได้' });
        }

        if (!scores || scores.length === 0) {
            return res.status(400).json({ status: 'error', message: 'กรุณาส่งข้อมูลการประเมิน' });
        }

        // เตรียมข้อมูลเพื่อ Insert
        const values = scores.map(score => [
            evaluation_id,
            evaluatee_id,
            score.indicator_id,
            score.self_info,
            score.self_score
        ]);

        await db.query(
            'INSERT INTO self_evaluations (evaluation_id, evaluatee_id, indicator_id, self_info, self_score) VALUES ?',
            [values]
        );

        res.status(201).json({
            status: 'success',
            message: 'บันทึกข้อมูลการประเมินตนเองเรียบร้อยแล้ว'
        });

    } catch (error) {
        res.status(500).json({ status: 'error', message: 'เกิดข้อผิดพลาด', error: error.message });
    }
};