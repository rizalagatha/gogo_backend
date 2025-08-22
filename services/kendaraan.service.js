// services/kendaraan.service.js

const mysql = require('mysql2/promise');
const dbConfig = require('../config/db.config');

// Fungsi untuk mengambil semua nomor plat kendaraan
async function getAllNoplat() {
    const connection = await mysql.createConnection(dbConfig);
    
    const sql = "SELECT noplat FROM tkendaraan ORDER BY noplat";
    
    const [rows] = await connection.execute(sql);

    await connection.end();

    // Mengubah array objek menjadi array string, mirip PDO::FETCH_COLUMN
    return rows.map(row => row.noplat);
}

async function getHistoryPerawatan(nopol, startDate, endDate) {
    const connection = await mysql.createConnection(dbConfig);
    // [PERBAIKAN] Mengirim data secara terpisah
    const sql = `
        SELECT
            IFNULL(b.jenis_perawatan, 'Lainnya') as tujuan,
            DATE_FORMAT(a.tanggal, '%d-%m-%Y') as tanggal,
            a.bengkel,
            a.biaya,
            a.KM
        FROM tperawatan a
        LEFT JOIN tjenisperawatan b ON a.jenis_perawatan = b.id
        WHERE a.tanggal BETWEEN ? AND ?
        AND a.nopol = ?
        ORDER BY a.tanggal DESC
    `;
    try {
        const [rows] = await connection.execute(sql, [startDate, endDate, nopol]);
        return rows;
    } finally {
        await connection.end();
    }
}

async function getAllKendaraan() {
    const connection = await mysql.createConnection(dbConfig);
    
    const sql = "SELECT noplat, keterangan FROM tkendaraan";
    
    const [rows] = await connection.execute(sql);

    await connection.end();
    return rows;
}

async function searchKendaraan(searchQuery) {
    const connection = await mysql.createConnection(dbConfig);

    const sql = "SELECT noplat FROM tkendaraan WHERE noplat LIKE ? ORDER BY noplat LIMIT 20";
    
    const [rows] = await connection.execute(sql, [`%${searchQuery}%`]);

    await connection.end();
    return rows.map(row => row.noplat);
}

module.exports = {
    getAllNoplat,
    getHistoryPerawatan,
    getAllKendaraan,
    searchKendaraan
};
