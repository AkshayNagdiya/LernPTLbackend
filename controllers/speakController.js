const speakdata = require('../models/speak');

const subjectCreate = async (req, res) => {
    try {
        const { subject } = req.body;
        const existingTutor = await speakdata.query('SELECT * FROM subjects WHERE name = ?', [subject]);
        if (existingTutor[0].length > 0) {
            res.status(200).json({ success: true, message: 'subject already exists'});
            return;
        }

        // Insert new tutor if it doesn't exist
        const insertResult = await speakdata.query('INSERT INTO subjects (name) VALUES (?)', [subject]);

        res.status(201).json({ success: true, message: 'subject created successfully' });
    } catch (error) {
        console.error('Error creating tutor:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};
const subjectShow = async (req, res) => {
    try {
        const result = await speakdata.query('SELECT * FROM subjects');
        res.json({ success: true, subjects: result[0] });
    } catch (error) {
        console.error('Error fetching speaks:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}
const subjectDelete = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await speakdata.query('DELETE FROM subjects WHERE id = ?', [id]);

        if (result[0].affectedRows > 0) {
            // Deletion successful
            res.json({ success: true, message: 'subject deleted successfully' });
        } else {
            // No rows were affected, meaning no tutor was found with the given id
            res.status(404).json({ success: false, error: 'subject not found' });
        }
    } catch (error) {
        console.error('Error deleting subject:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}

const subjectShowbyid = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await speakdata.query('SELECT * FROM subjects WHERE id = ?', [id]);

        if (result[0].length > 0) {
            // Tutor found
            res.json({ success: true, subject: result[0][0] });
        } else {
            // No tutor found with the given id
            res.status(404).json({ success: false, error: 'subject not found' });
        }
    } catch (error) {
        console.error('Error fetching country by ID:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};
const updatesSubject = async (req, res) => {
    try {
        const { id } = req.params;
        const { subject } = req.body;
        const result = await speakdata.query('UPDATE subjects SET name = ? WHERE id = ?', [subject, id]);

        if (result[0].affectedRows > 0) {
            // Update successful
            res.json({ success: true, message: 'subject updated successfully' });
        } else {
            // No rows were affected, meaning no tutor was found with the given id
            res.status(404).json({ success: false, error: 'subject not found' });
        }
    } catch (error) {
        console.error('Error updating tutor:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}



const speakcreate = async (req, res) => {
    try {
        const { speak } = req.body;
        const existingTutor = await speakdata.query('SELECT * FROM speak WHERE speak = ?', [speak]);
        if (existingTutor[0].length > 0) {
            res.status(200).json({ success: true, message: 'speak already exists'});
            return;
        }

        // Insert new tutor if it doesn't exist
        const insertResult = await speakdata.query('INSERT INTO speak (speak) VALUES (?)', [speak]);

        res.status(201).json({ success: true, message: 'speak created successfully' });
    } catch (error) {
        console.error('Error creating tutor:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};


const speakshow = async (req, res) => {
    try {
        const result = await speakdata.query('SELECT * FROM speak');
        res.json({ success: true, speaks: result[0] });
    } catch (error) {
        console.error('Error fetching speaks:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}

const speakdelete = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await speakdata.query('DELETE FROM speak WHERE id = ?', [id]);

        if (result[0].affectedRows > 0) {
            // Deletion successful
            res.json({ success: true, message: 'speak deleted successfully' });
        } else {
            // No rows were affected, meaning no tutor was found with the given id
            res.status(404).json({ success: false, error: 'Tutor not found' });
        }
    } catch (error) {
        console.error('Error deleting speak:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}


const updatesspeak = async (req, res) => {
    try {
        const { id } = req.params;
        const { speak } = req.body;
        const result = await speakdata.query('UPDATE speak SET speak = ? WHERE id = ?', [speak, id]);

        if (result[0].affectedRows > 0) {
            // Update successful
            res.json({ success: true, message: 'speak updated successfully' });
        } else {
            // No rows were affected, meaning no tutor was found with the given id
            res.status(404).json({ success: false, error: 'speak not found' });
        }
    } catch (error) {
        console.error('Error updating tutor:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}

const speakshowbyid = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await speakdata.query('SELECT * FROM speak WHERE id = ?', [id]);

        if (result[0].length > 0) {
            // Tutor found
            res.json({ success: true, speak: result[0][0] });
        } else {
            // No tutor found with the given id
            res.status(404).json({ success: false, error: 'speak not found' });
        }
    } catch (error) {
        console.error('Error fetching country by ID:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

module.exports = {
    subjectCreate,
    subjectShow,
    subjectDelete,
    subjectShowbyid,
    updatesSubject,
    speakcreate,
    speakshow,
    speakdelete,
    updatesspeak,
    speakshowbyid,
};