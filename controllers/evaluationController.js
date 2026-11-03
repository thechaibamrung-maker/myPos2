const db = require('../config/db');

exports.createEvaluation = async (req, res) => {
    const connection = await db.getConnection(); // ใช้ Transaction เผื่อบันทึกพลาดจะได้ย้อนกลับข้อมูลได้
    try {
        const { title, start_date, end_date, indicators } = req.body;
        const created_by = req.user.id; // ได้มาจาก Token

        // ตรวจสอบสิทธิ์ว่าต้องเป็น Role: hr เท่านั้น
        if (req.user.role !== 'hr') {
            return res.status(403).json({ status: 'error', message: 'เฉพาะงานบุคลากร (HR) เท่านั้นที่สามารถทำรายการนี้ได้' });
        }

        await connection.beginTransaction();

        // ส่วนที่ 1: บันทึกหัวข้อการประเมิน (ข้อ 5.1.1 และ 5.1.2)
        const [evalResult] = await connection.query(
            'INSERT INTO evaluations (title, start_date, end_date, created_by) VALUES (?, ?, ?, ?)',
            [title, start_date, end_date, created_by]
        );
        const evaluationId = evalResult.insertId;

        // ส่วนที่ 2: บันทึกตัวชี้วัดหลายๆ ข้อพร้อมกัน (ข้อ 5.1.3, 5.1.4, 5.1.5)[cite: 7]
        if (indicators && indicators.length > 0) {
            const indicatorValues = indicators.map(ind => [
                evaluationId,
                ind.name,
                ind.description,
                ind.weight,
                ind.criteria_type,
                ind.attachment_path || null
            ]);

            await connection.query(
                'INSERT INTO indicators (evaluation_id, name, description, weight, criteria_type, attachment_path) VALUES ?',
                [indicatorValues]
            );
        }

        await connection.commit();
        res.status(201).json({ 
            status: 'success', 
            message: 'สร้างหัวข้อการประเมินและตัวชี้วัดสำเร็จ', 
            data: { evaluationId } 
        });

    } catch (error) {
        await connection.rollback();
        res.status(500).json({ status: 'error', message: 'เกิดข้อผิดพลาด', error: error.message });
    } finally {
        connection.release();
    }
};

// API สำหรับมอบหมายกรรมการและผู้ถูกประเมิน (ครอบคลุมข้อ 5.1.6 ถึง 5.1.9)[cite: 7]
exports.assignEvaluators = async (req, res) => {
    try {
        // ตรวจสอบสิทธิ์ว่าต้องเป็น Role: hr เท่านั้น
        if (req.user.role !== 'hr') {
            return res.status(403).json({ status: 'error', message: 'เฉพาะงานบุคลากร (HR) เท่านั้นที่สามารถทำรายการนี้ได้' });
        }

        const evaluationId = req.params.id; // รับ ID ของการประเมินจาก URL
        const { assignments } = req.body; 
        // ตัวอย่างรูปแบบที่ส่งมา: [{ evaluator_id: 2, evaluatee_id: 3, evaluator_role: 'president' }]

        if (!assignments || assignments.length === 0) {
            return res.status(400).json({ status: 'error', message: 'กรุณาส่งข้อมูลการมอบหมาย' });
        }

        // จัดเตรียมข้อมูลเพื่อ Insert ลง Database
        const values = assignments.map(a => [
            evaluationId,
            a.evaluator_id,
            a.evaluatee_id,
            a.evaluator_role // กำหนดบทบาท ประธาน/กรรมการร่วม (ข้อ 5.1.9)[cite: 7]
        ]);

        // บันทึกลงตาราง evaluation_assignments
        await db.query(
            'INSERT INTO evaluation_assignments (evaluation_id, evaluator_id, evaluatee_id, evaluator_role) VALUES ?',
            [values]
        );

        res.status(201).json({
            status: 'success',
            message: 'มอบหมายกรรมการและผู้รับการประเมินสำเร็จ'
        });

    } catch (error) {
        res.status(500).json({ status: 'error', message: 'เกิดข้อผิดพลาด', error: error.message });
    }
};