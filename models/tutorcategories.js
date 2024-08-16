const mysql = require("mysql2");
const bluebird = require('bluebird');

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

// Promisify the query method of the pool
pool.query = bluebird.promisify(pool.query);

// Ensure the tutor table is created
pool.query(`
CREATE TABLE IF NOT EXISTS tutorcategories(
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    Supertutors BOOLEAN NOT NULL,
    professionaltutors BOOLEAN NOT NULL
)
`);

// Export the promise version of the pool
module.exports = pool.promise();
