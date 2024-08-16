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
