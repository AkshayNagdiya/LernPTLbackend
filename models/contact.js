const mysql = require("mysql2");
const bluebird = require('bluebird');

// Create a connection pool
const pool = mysql.createPool({
    host: 'dpg-cqvglpdds78s739j4fn0-a',
    user: 'lernptldatabase_user',
    password: 'ImIHdRRdqLn0VdboUDjUYYDAayjKkBtt',
    database: 'lernptldatabase',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Get the promise implementation, using bluebird
pool.query = bluebird.promisify(pool.query);

// Create the contact table
pool.query(`
    CREATE TABLE IF NOT EXISTS contact (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        email VARCHAR(255), 
        issue VARCHAR(255)
    )
`);

module.exports = pool.promise();
