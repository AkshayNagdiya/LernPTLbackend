const countrydata = require('../models/country');

const countrycreate = async (req, res) => {
    try {
        const { country } = req.body;
        const existingTutor = await countrydata.query('SELECT * FROM country WHERE country = ?', [country]);
        if (existingTutor[0].length > 0) {
            res.status(200).json({ success: true, message: 'country already exists'});
            return;
        }

        // Insert new tutor if it doesn't exist
        const insertResult = await countrydata.query('INSERT INTO country (country) VALUES (?)', [country]);

        res.status(201).json({ success: true, message: 'country created successfully' });
    } catch (error) {
        console.error('Error creating tutor:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

const countryshow = async (req, res) => {
    try {
        const result = await countrydata.query('SELECT * FROM country');
        res.json({ success: true, countrys: result[0] });
    } catch (error) {
        console.error('Error fetching countrys:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}

const countrydelete = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await countrydata.query('DELETE FROM country WHERE id = ?', [id]);

        if (result[0].affectedRows > 0) {
            // Deletion successful
            res.json({ success: true, message: 'country deleted successfully' });
        } else {
            // No rows were affected, meaning no tutor was found with the given id
            res.status(404).json({ success: false, error: 'country not found' });
        }
    } catch (error) {
        console.error('Error deleting tutor:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}


const updatescountry = async (req, res) => {
    try {
        const { id } = req.params;
        const { country } = req.body;
        const result = await countrydata.query('UPDATE country SET country = ? WHERE id = ?', [country, id]);

        if (result[0].affectedRows > 0) {
            // Update successful
            res.json({ success: true, message: 'country updated successfully' });
        } else {
            // No rows were affected, meaning no tutor was found with the given id
            res.status(404).json({ success: false, error: 'Tutor not found' });
        }
    } catch (error) {
        console.error('Error updating tutor:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}


const countryshowbyid = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await countrydata.query('SELECT * FROM country WHERE id = ?', [id]);

        if (result[0].length > 0) {
            // Tutor found
            res.json({ success: true, country: result[0][0] });
        } else {
            // No tutor found with the given id
            res.status(404).json({ success: false, error: 'country not found' });
        }
    } catch (error) {
        console.error('Error fetching country by ID:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

module.exports = {
    countrycreate,
    countryshow,
    countrydelete,
    updatescountry,
    countryshowbyid,
};