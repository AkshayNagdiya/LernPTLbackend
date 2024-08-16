const mysql = require("mysql2");
const bluebird = require('bluebird');

// Create a connection pool
const pool = mysql.createPool({
   host: "mysql-2368b285-tarunbirla2018-e2d8.b.aivencloud.com",
  user: "avnadmin",
  password: "AVNS_TFeDdKhxtYJU9BIZdqg",
  database: "defaultdb",
    port : 14789,
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
