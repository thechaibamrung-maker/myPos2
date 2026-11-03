const db = require('../config/db');

// API สำหรับกรรมการส่งผลประเมิน (เกณฑ์ 5.3.4, 5.3.5, 5.3.7, 5.3.8)
exports.submitEvaluation = async (req, res) => {
    const connection = await db.getConnection();
    try {
        const evaluator_id = req.user.id;
        const evaluation_id = req.params.id; 
        const evaluatee_id = req.body.evaluatee_id;
        const { scores, summary_comment, signature_path } = req.body;

        // เช็คสิทธิ์ว่าเป็นกรรมการเท่านั้น
        if (req.user.role !== 'evaluator') {
            return res.status(403).json({ status: 'error', message: 'เฉพาะกรรมการผู้ประเมินเท่านั้นที่ทำรายการนี้ได้' });
        }

        await connection.beginTransaction();

        // 1. บันทึกคะแนนรายตัวชี้วัด (ข้อ 5.3.4)
        if (scores && scores.length > 0) {
            const scoreValues = scores.map(s => [
                evaluation_id, evaluator_id, evaluatee_id, s.indicator_id, s.score
            ]);
            await connection.query(
                'INSERT INTO evaluator_scores (evaluation_id, evaluator_id, evaluatee_id, indicator_id, score) VALUES ?',
                [scoreValues]
            );
        }

        // 2. บันทึกความเห็นสรุปและแนบลายเซ็น (ข้อ 5.3.5 และ 5.3.7)
        await connection.query(
            'INSERT INTO evaluation_summaries (evaluation_id, evaluator_id, evaluatee_id, summary_comment, signature_path) VALUES (?, ?, ?, ?, ?)',
            [evaluation_id, evaluator_id, evaluatee_id, summary_comment, signature_path]
        );

        await connection.commit();
        res.status(201).json({ 
            status: 'success', 
            message: 'ยืนยันและส่งผลการประเมินสำเร็จ' // (ข้อ 5.3.8)
        });

    } catch (error) {
        await connection.rollback();
        res.status(500).json({ status: 'error', message: 'เกิดข้อผิดพลาด', error: error.message });
    } finally {
        connection.release();
    }
};