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
    queueLimit: 0
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
