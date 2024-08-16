const tutorCategoriesModel = require('../models/tutorcategories');
const db = require('../models/user');

const tutorcategoriescreate = async (req, res) => {
    const { user_id, Supertutors, professionaltutors } = req.body;

    try {
        // Check if the user exists
        const [user] = await db.query('SELECT * FROM users WHERE id = ?', [user_id]);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Check if the tutor category with the specified user_id already exists
        const [existingTutorCategory] = await tutorCategoriesModel.query(
            'SELECT * FROM tutorcategories WHERE user_id = ?',
            [user_id]
        );

        if (existingTutorCategory.length > 0) {
            // If the tutor category already exists, update the existing entry
            await tutorCategoriesModel.query(
                'UPDATE tutorcategories SET Supertutors = ?, professionaltutors = ? WHERE user_id = ?',
                [Supertutors, professionaltutors, user_id]
            );

            return res.status(200).json({ success: true, message: 'Tutor category updated successfully.' });
        }

        // If the tutor category doesn't exist, add it to the database
        await tutorCategoriesModel.query(
            'INSERT INTO tutorcategories (user_id, Supertutors, professionaltutors) VALUES (?, ?, ?)',
            [user_id, Supertutors, professionaltutors]
        );

        res.status(201).json({ success: true, message: 'Tutor category added successfully.' });
    } catch (error) {
        console.error('Error in speakercreate:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = {
    tutorcategoriescreate,
};
