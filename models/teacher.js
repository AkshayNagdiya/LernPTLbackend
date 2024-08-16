const mysql = require("mysql2");
const bluebird = require('bluebird');

// Create a connection pool for PostgreSQL
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
pool.query = bluebird.promisify(pool.query);

pool.query(`
    CREATE TABLE IF NOT EXISTS teacher (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL
       
        
    )
`);

module.exports = pool.promise();
