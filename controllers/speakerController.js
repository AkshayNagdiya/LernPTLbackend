const speakerdata = require('../models/speaker');
const db = require('../models/user');

const speakercreate = async (req, res) => {
    const { user_id, speaker } = req.body;

    try {
        // Check if the user exists
        const [user] = await db.query('SELECT * FROM users WHERE id = ?', [user_id]);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Check if the speaker with the specified user_id already exists
        const [existingSpeaker] = await speakerdata.query(
            'SELECT * FROM speaker WHERE user_id = ?',
            [user_id]
        );

        if (existingSpeaker.length > 0) {
            // If the speaker already exists, update the existing entry
            await speakerdata.query(
                'UPDATE speaker SET speaker = ? WHERE user_id = ?',
                [speaker, user_id]
            );

            return res.status(200).json({ success: true, message: 'Speaker updated successfully.' });
        }

        // If the speaker doesn't exist, add it to the database
        await speakerdata.query('INSERT INTO speaker (user_id, speaker) VALUES (?, ?)', [user_id, speaker]);

        res.status(201).json({ success: true, message: 'Speaker added successfully.' });
    } catch (error) {
        console.error('Error in speakercreate:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = {
    speakercreate,
};
