const mysql = require("mysql2");
const bluebird = require('bluebird');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'cmsfylqm_storyfypro',
    password: 'cmsfylqm_storyfypro',
    database: 'cmsfylqm_storyfypro',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Promisify the query method of the pool
pool.query = bluebird.promisify(pool.query);

// Ensure the tutor table is created
pool.query(`
CREATE TABLE IF NOT EXISTS speaker(
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    speaker BOOLEAN NOT NULL
)
`);

// Export the promise version of the pool
module.exports = pool.promise();