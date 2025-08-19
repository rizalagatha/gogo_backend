// services/perawatan.service.js

const mysql = require('mysql2/promise');
const dbConfig = require('../config/db.config');

// Fungsi untuk mengambil data yang dibutuhkan form input perawatan
async function getFormData() {
    const connection = await mysql.createConnection(dbConfig);
    
    const sql = "SELECT id, Jenis_perawatan FROM tjenisperawatan ORDER BY id";
    
    const [rows] = await connection.execute(sql);

    await connection.end();
    return rows;
}

// Tambahkan fungsi layanan perawatan lain di sini nanti
async function submitPerawatan(perawatanData) {
    const connection = await mysql.createConnection(dbConfig);

    const sql = `
        INSERT INTO tperawatan (nopol, km, tanggal, jenis_perawatan, note, bengkel, biaya) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await connection.execute(sql, [
        perawatanData.nopol,
        perawatanData.km,
        perawatanData.tanggal,
        perawatanData.jenis_perawatan_id,
        perawatanData.note,
        perawatanData.bengkel,
        perawatanData.biaya
    ]);

    await connection.end();
    return result;
}

module.exports = {
    getFormData,
    submitPerawatan
};
