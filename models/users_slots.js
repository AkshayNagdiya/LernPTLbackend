const mysql = require("mysql2");
const bluebird = require('bluebird');

const pool = mysql.createPool({
    host: 'dpg-cqvglpdds78s739j4fn0-a',
    user: 'lernptldatabase_user',
    password: 'ImIHdRRdqLn0VdboUDjUYYDAayjKkBtt',
    database: 'lernptldatabase',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

pool.query = bluebird.promisify(pool.query);

pool.query(`
    CREATE TABLE IF NOT EXISTS users_slots (
        id INT AUTO_INCREMENT PRIMARY KEY,
        teacher_id INT NOT NULL,
        day VARCHAR(100) NOT NULL,
        from_time TIME NOT NULL,
        to_time TIME NOT NULL,
        timezone VARCHAR(100) NOT NULL,
        created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (teacher_id) REFERENCES users(id)
    )
`);

module.exports = pool.promise();
