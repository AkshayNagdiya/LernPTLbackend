const mysql = require("mysql2");
const Joi = require('joi');

// Create MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'cmsfylqm_storyfypro',
    password: 'cmsfylqm_storyfypro',
    database: 'cmsfylqm_storyfypro'
});

connection.connect();

// Define the schema for rating creation
const ratingCreateSchema = Joi.object({
    rating: Joi.number().required(),
    user_id: Joi.string().required(),
    teacher_id: Joi.string().required(),
    review: Joi.string().required(),
});

const ratingCreate = async (req, res) => {
    try {
        // Validate the request body against the schema
        const { error } = ratingCreateSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, error: error.details[0].message });
        }

        // Check if the rating already exists for the user
        const existingRating = await checkRatingExists(req.body.user_id, req.body.teacher_id, req.body.review);
        if (existingRating.length > 0) {
            return res.status(200).json({ success: false, message: 'Rating already exists for this user' });
        }

        // If the rating does not exist, proceed with creating it
        await createRating(req.body.rating, req.body.user_id, req.body.teacher_id);
        res.status(201).json({ success: true, message: 'Rating created successfully' });
    } catch (error) {
        console.error('Error creating rating:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

const checkRatingExists = async (userId, teacherId) => {
    const query = 'SELECT * FROM rating WHERE user_id = ? AND teacher_id = ?';
    return executeQuery(query, [userId, teacherId]);
};

const createRating = async (rating, userId, teacherId,review) => {
    const insertQuery = 'INSERT INTO rating (rating, user_id, teacher_id, review) VALUES (?, ?, ?, ?)';
    return executeQuery(insertQuery, [rating, userId, teacherId]);
};

const executeQuery = async (query, params) => {
    return new Promise((resolve, reject) => {
        connection.query(query, params, (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
};

const ratingshow = async (req, res) => {
    try {
        const result = await executeQuery('SELECT * FROM rating');
        res.json({ success: true, ratings: result });
    } catch (error) {
        console.error('Error fetching rating:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

const ratingdelete = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await executeQuery('DELETE FROM rating WHERE id = ?', [id]);

        if (result.affectedRows > 0) {
            // Deletion successful
            res.json({ success: true, message: 'Rating deleted successfully' });
        } else {
            // No rows were affected, meaning no rating was found with the given id
            res.status(404).json({ success: false, error: 'Rating not found' });
        }
    } catch (error) {
        console.error('Error deleting rating:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

const updatesrating = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating } = req.body;
        const result = await executeQuery('UPDATE rating SET rating = ? WHERE id = ?', [rating, id]);

        if (result.affectedRows > 0) {
            // Update successful
            res.json({ success: true, message: 'Rating updated successfully' });
        } else {
            // No rows were affected, meaning no rating was found with the given id
            res.status(404).json({ success: false, error: 'Rating not found' });
        }
    } catch (error) {
        console.error('Error updating rating:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

const ratingshowbyid = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await executeQuery('SELECT * FROM rating WHERE id = ?', [id]);

        if (result.length > 0) {
            // Rating found
            res.json({ success: true, rating: result[0] });
        } else {
            // No rating found with the given id
            res.status(404).json({ success: false, error: 'Rating not found' });
        }
    } catch (error) {
        console.error('Error fetching rating by ID:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

module.exports = {
    ratingCreate,
    ratingshow,
    ratingdelete,
    updatesrating,
    ratingshowbyid,
};
