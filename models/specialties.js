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

// Promisify the query method of the pool
pool.query = bluebird.promisify(pool.query);

// Ensure the tutor table is created
pool.query(`
    CREATE TABLE IF NOT EXISTS specialties(
        id INT AUTO_INCREMENT PRIMARY KEY,
        specialties VARCHAR(255) NOT NULL UNIQUE
    )
`);

// Export the promise version of the pool
module.exports = pool.promise();