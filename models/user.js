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
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        firstname VARCHAR(255)  NULL,
        lastname VARCHAR(255)  NULL,
        code VARCHAR(255)  NULL,
        mobileNumber INT  NULL,
        role VARCHAR(255) NOT NULL
        
    )
`);

// Create the wishlists table
pool.query(`
    CREATE TABLE IF NOT EXISTS wishlists (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT,
        productId INT,
        FOREIGN KEY (userId) REFERENCES users(id),
        FOREIGN KEY (productId) REFERENCES latest(id)
    ) 
`);
module.exports = pool.promise();
