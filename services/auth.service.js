// services/auth.service.js

const mysql = require('mysql2/promise');
const dbConfig = require('../config/db.config');

async function login(username, password) {
    const connection = await mysql.createConnection(dbConfig);
    
    // Query aman menggunakan prepared statements
    const sql = "SELECT kar_kode, kar_nama, kar_isdriver FROM tkaryawan WHERE kar_kode = ? AND kar_password = ?";
    
    const [rows] = await connection.execute(sql, [username, password]);

    await connection.end();

    // Kembalikan data pengguna jika ditemukan, jika tidak kembalikan null
    return rows.length > 0 ? rows[0] : null;
}
async function getPasswordByKode(kode) {
    const connection = await mysql.createConnection(dbConfig);
    const sql = "SELECT kar_password FROM tkaryawan WHERE kar_kode = ?";
    const [rows] = await connection.execute(sql, [kode]);
    await connection.end();
    return rows.length > 0 ? rows[0] : null;
}

module.exports = {
    login,
    getPasswordByKode
};
