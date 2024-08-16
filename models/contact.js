const mysql = require("mysql2");
const bluebird = require('bluebird');

// Create a connection pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'cmsfylqm_storyfypro',
    password: 'cmsfylqm_storyfypro',
    database: 'cmsfylqm_storyfypro',
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
