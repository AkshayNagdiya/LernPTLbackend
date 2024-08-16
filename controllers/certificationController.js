const certificationdata  = require('../models/certification');

const certificationcreate = async (req, res) => {
    try {
        const { certification } = req.body;
        const existingTutor = await certificationdata .query('SELECT * FROM certification WHERE certification = ?', [certification]);
        if (existingTutor[0].length > 0) {
            res.status(200).json({ success: true, message: 'certification already exists'});
            return;
        }

        // Insert new tutor if it doesn't exist
        const insertResult = await certificationdata .query('INSERT INTO certification (certification) VALUES (?)', [certification]);

        res.status(201).json({ success: true, message: 'certification created successfully' });
    } catch (error) {
        console.error('Error creating tutor:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

const certificationshow = async (req, res) => {
    try {
        const result = await certificationdata .query('SELECT * FROM certification');
        res.json({ success: true, certification: result[0] });
    } catch (error) {
        console.error('Error fetching countrys:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}

const certificationdelete = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await certificationdata .query('DELETE FROM certification WHERE id = ?', [id]);

        if (result[0].affectedRows > 0) {
            // Deletion successful
            res.json({ success: true, message: 'certification deleted successfully' });
        } else {
            // No rows were affected, meaning no tutor was found with the given id
            res.status(404).json({ success: false, error: 'certification not found' });
        }
    } catch (error) {
        console.error('Error deleting tutor:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}

const updatescertification = async (req, res) => {
    try {
        const { id } = req.params;
        const { certification } = req.body;
        const result = await certificationdata .query('UPDATE certification SET certification = ? WHERE id = ?', [certification, id]);

        if (result[0].affectedRows > 0) {
            // Update successful
            res.json({ success: true, message: 'certification updated successfully' });
        } else {
            // No rows were affected, meaning no tutor was found with the given id
            res.status(404).json({ success: false, error: 'certification not found' });
        }
    } catch (error) {
        console.error('Error updating tutor:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}


const certificationshowbyid = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await certificationdata .query('SELECT * FROM certification WHERE id = ?', [id]);

        if (result[0].length > 0) {
            // Tutor found
            res.json({ success: true, certification: result[0][0] });
        } else {
            // No tutor found with the given id
            res.status(404).json({ success: false, error: 'certification not found' });
        }
    } catch (error) {
        console.error('Error fetching country by ID:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

module.exports = {
    certificationcreate,
    certificationshow,
    certificationdelete,
    updatescertification,
    certificationshowbyid,
};