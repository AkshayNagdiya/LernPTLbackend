const mysql = require("mysql2");
const bluebird = require("bluebird");

const pool = mysql.createPool({
  host: "mysql-2368b285-tarunbirla2018-e2d8.b.aivencloud.com",
  user: "avnadmin",
  password: "AVNS_TFeDdKhxtYJU9BIZdqg",
  database: "defaultdb",
    port : 14789,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
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
