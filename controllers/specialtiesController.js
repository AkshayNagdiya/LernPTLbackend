const specialtiesdata = require('../models/specialties');

const specialtiescreate = async (req, res) => {
    try {
        const { specialties } = req.body;
        const existingTutor = await specialtiesdata.query('SELECT * FROM specialties WHERE specialties = ?', [specialties]);
        if (existingTutor[0].length > 0) {
            res.status(200).json({ success: true, message: 'specialties already exists'});
            return;
        }

        // Insert new tutor if it doesn't exist
        const insertResult = await specialtiesdata.query('INSERT INTO specialties (specialties) VALUES (?)', [specialties]);

        res.status(201).json({ success: true, message: 'specialties created successfully' });
    } catch (error) {
        console.error('Error creating tutor:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

const specialtiesshow = async (req, res) => {
    try {
        const result = await specialtiesdata.query('SELECT * FROM specialties');
        res.json({ success: true, specialties: result[0] });
    } catch (error) {
        console.error('Error fetching specialties:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}

const specialtiesdelete = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await specialtiesdata.query('DELETE FROM specialties WHERE id = ?', [id]);

        if (result[0].affectedRows > 0) {
            // Deletion successful
            res.json({ success: true, message: 'specialties deleted successfully' });
        } else {
            // No rows were affected, meaning no tutor was found with the given id
            res.status(404).json({ success: false, error: 'specialties not found' });
        }
    } catch (error) {
        console.error('Error deleting tutor:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}


const updatesspecialties = async (req, res) => {
    try {
        const { id } = req.params;
        const { specialties } = req.body;
        const result = await specialtiesdata.query('UPDATE specialties SET specialties = ? WHERE id = ?', [specialties, id]);

        if (result[0].affectedRows > 0) {
            // Update successful
            res.json({ success: true, message: 'specialties updated successfully' });
        } else {
            // No rows were affected, meaning no tutor was found with the given id
            res.status(404).json({ success: false, error: 'specialties not found' });
        }
    } catch (error) {
        console.error('Error updating tutor:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}

const specialtiesshowbyid = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await specialtiesdata.query('SELECT * FROM specialties WHERE id = ?', [id]);

        if (result[0].length > 0) {
            // Tutor found
            res.json({ success: true, specialties: result[0][0] });
        } else {
            // No tutor found with the given id
            res.status(404).json({ success: false, error: 'specialties not found' });
        }
    } catch (error) {
        console.error('Error fetching specialties by ID:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

module.exports = {
    specialtiescreate,
    specialtiesshow,
    specialtiesdelete,
    updatesspecialties,
    specialtiesshowbyid,
};