// services/version.service.js

const mysql = require('mysql2/promise');
const dbConfig = require('../config/db.config');

async function getAppVersion() {
    const connection = await mysql.createConnection(dbConfig);
    
    const sql = "SELECT versi FROM tversi WHERE aplikasi = ?";
    
    // Eksekusi query dengan parameter 'GOGO'
    const [rows] = await connection.execute(sql, ['GOGO']);

    await connection.end();

    // Kembalikan baris pertama yang ditemukan, atau null jika tidak ada
    return rows.length > 0 ? rows[0] : null;
}

module.exports = {
    getAppVersion
};
