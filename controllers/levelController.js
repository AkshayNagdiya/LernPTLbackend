const leveldata  = require('../models/level');

const levelcreate = async (req, res) => {
    try {
        const { level } = req.body;
        const existingTutor = await leveldata .query('SELECT * FROM level WHERE level = ?', [level]);
        if (existingTutor[0].length > 0) {
            res.status(200).json({ success: true, message: 'level already exists'});
            return;
        }

        // Insert new tutor if it doesn't exist
        const insertResult = await leveldata .query('INSERT INTO level (level) VALUES (?)', [level]);

        res.status(201).json({ success: true, message: 'level created successfully' });
    } catch (error) {
        console.error('Error creating tutor:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

const levelshow = async (req, res) => {
    try {
        const result = await leveldata .query('SELECT * FROM level');
        res.json({ success: true, level: result[0] });
    } catch (error) {
        console.error('Error fetching countrys:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}

const leveldelete = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await leveldata .query('DELETE FROM level WHERE id = ?', [id]);

        if (result[0].affectedRows > 0) {
            // Deletion successful
            res.json({ success: true, message: 'level deleted successfully' });
        } else {
            // No rows were affected, meaning no tutor was found with the given id
            res.status(404).json({ success: false, error: 'level not found' });
        }
    } catch (error) {
        console.error('Error deleting tutor:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}

const updateslevel = async (req, res) => {
    try {
        const { id } = req.params;
        const { level } = req.body;
        const result = await leveldata .query('UPDATE level SET level = ? WHERE id = ?', [level, id]);

        if (result[0].affectedRows > 0) {
            // Update successful
            res.json({ success: true, message: 'level updated successfully' });
        } else {
            // No rows were affected, meaning no tutor was found with the given id
            res.status(404).json({ success: false, error: 'level not found' });
        }
    } catch (error) {
        console.error('Error updating tutor:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}


const levelshowbyid = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await leveldata .query('SELECT * FROM level WHERE id = ?', [id]);

        if (result[0].length > 0) {
            // Tutor found
            res.json({ success: true, level: result[0][0] });
        } else {
            // No tutor found with the given id
            res.status(404).json({ success: false, error: 'level not found' });
        }
    } catch (error) {
        console.error('Error fetching country by ID:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

module.exports = {
    levelcreate,
    levelshow,
    leveldelete,
    updateslevel,
    levelshowbyid,
};