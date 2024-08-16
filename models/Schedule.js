const mysql = require("mysql2");
const bluebird = require('bluebird');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'storyfy',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Promisify the query method of the pool //

pool.query = bluebird.promisify(pool.query);

// Ensure the tutor table is created

// pool.query(`
//     CREATE TABLE IF NOT EXISTS schedule (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         scheduledata  json DEFAULT NULL
//     )
// `);

// Export the promise version of the pool

module.exports = pool.promise();