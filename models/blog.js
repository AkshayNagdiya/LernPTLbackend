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
    CREATE TABLE IF NOT EXISTS blogs(
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL UNIQUE,
        description VARCHAR(255) NOT NULL,
        dates VARCHAR(255) NOT NULL,
        comments VARCHAR(255) NOT NULL,
          categories VARCHAR(255) NOT NULL,
        image VARCHAR(255) NOT NULL
    )
`);

pool.query(`
    CREATE TABLE IF NOT EXISTS blogscategories(
        id INT AUTO_INCREMENT PRIMARY KEY,
        blogcategories VARCHAR(255) NOT NULL UNIQUE
      
    )
`);


module.exports = pool.promise();
