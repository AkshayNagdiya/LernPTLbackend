const schedule = require('../models/Schedule')
const latest = require('../models/latest')

 // Assuming your database connection is exported from db.js

const createschedule = async (req, res) => {
    try {
        const { id } = req.params;
        const { scheduledata } = req.body;

        // Insert the new schedule into the database
        await schedule.query('INSERT INTO schedule (scheduledata) VALUES (?)', [JSON.stringify(scheduledata)]);

        // Update the latest API with the new schedule for the given Eid
        await latest.query('UPDATE latest SET schedule = ? WHERE id = ?', [JSON.stringify(scheduledata), id]);

        res.status(200).json({ message: 'Schedule created successfully' });
    } catch (error) {
        console.error('Error creating schedule:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    createschedule
};
