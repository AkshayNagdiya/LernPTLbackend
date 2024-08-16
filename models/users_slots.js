const { Pool } = require("pg"); // Correctly import the PostgreSQL client
const bluebird = require('bluebird');

// Create a connection pool for PostgreSQL
const pool = new Pool({
    host: 'dpg-cqvglpdds78s739j4fn0-a',
    user: 'lernptldatabase_user',
    password: 'ImIHdRRdqLn0VdboUDjUYYDAayjKkBtt',
    database: 'lernptldatabase',
    port: 5432, // Default port for PostgreSQL
    max: 10, // Connection limit
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

pool.query = bluebird.promisify(pool.query);

pool.query(`
    CREATE TABLE IF NOT EXISTS users_slots (
        id INT AUTO_INCREMENT PRIMARY KEY,
        teacher_id INT NOT NULL,
        day VARCHAR(100) NOT NULL,
        from_time TIME NOT NULL,
        to_time TIME NOT NULL,
        timezone VARCHAR(100) NOT NULL,
        created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (teacher_id) REFERENCES users(id)
    )
`);

module.exports = pool.promise();
