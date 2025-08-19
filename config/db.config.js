// config/db.config.js

// [PERUBAHAN] Import dotenv dan panggil config()
require('dotenv').config();

// [PERUBAHAN] Gunakan variabel dari process.env
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

module.exports = dbConfig;
