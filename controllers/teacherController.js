const tercher =require('../models/teacher')

const teachercreate =async(req,res)=>{
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        const connection = await tercher.getConnection();

        try {
            const query = 'INSERT INTO teacher (email, password) VALUES (?, ?)';
            const values = [email, password];

            const [result] = await connection.execute(query, values);

            res.status(201).json({ success: true, teacherId: result.insertId });
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'All ready ' + error.message });
    }
}

const teachershow =async(req,res)=>{
    try {
        const connection = await tercher.getConnection();

        try {
            const [teachers] = await connection.execute('SELECT * FROM teacher');

            res.status(200).json({ success: true, teachers });
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error: ' + error.message });
    }
}

module.exports = {
    teachercreate,
    teachershow,
};