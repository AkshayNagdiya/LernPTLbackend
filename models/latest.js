const mysql = require("mysql2");
const bluebird = require('bluebird');

// Create a connection pool
const pool = mysql.createPool({
    host: 'dpg-cqvglpdds78s739j4fn0-a',
    user: 'lernptldatabase_user',
    password: 'ImIHdRRdqLn0VdboUDjUYYDAayjKkBtt',
    database: 'lernptldatabase',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Get the promise implementation, using bluebird
pool.query = bluebird.promisify(pool.query);

// Create the latest table
pool.query(`
    CREATE TABLE IF NOT EXISTS latest (
        id INT AUTO_INCREMENT PRIMARY KEY,
        techearid INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        lastname VARCHAR(255),
        country VARCHAR(255) NOT NULL,
        categories VARCHAR(255) NOT NULL, 
        level VARCHAR(255),
        mobileNumber VARCHAR(255) NOT NULL,
        subjectchoise VARCHAR(255) NOT NULL,
        image VARCHAR(255) NOT NULL,
        certificate JSON DEFAULT NULL,
        Education JSON DEFAULT NULL,
        Schedule JSON DEFAULT NULL,
        speak JSON DEFAULT NULL,
        description TEXT,
        firstprice DECIMAL(10, 2),
        price DECIMAL(10, 2),
        rating INT,
        review INT,
        slotbookCount INT,
        duration VARCHAR(255),
        Supertutors BOOLEAN NOT NULL,
        professionaltutors BOOLEAN NOT NULL,
        specialties VARCHAR(255),
        speaker BOOLEAN NOT NULL,
        video VARCHAR(255),
        verified BOOLEAN NOT NULL DEFAULT 0
    )
`);

module.exports = pool.promise();
