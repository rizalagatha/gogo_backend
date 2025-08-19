// services/karyawan.service.js

const mysql = require('mysql2/promise');
const dbConfig = require('../config/db.config');

async function getAllActive() {
    const connection = await mysql.createConnection(dbConfig);
    
    const sql = "SELECT kar_kode, kar_nama FROM tkaryawan WHERE kar_aktif = 0 ORDER BY kar_nama ASC";
    const [rows] = await connection.execute(sql);

    await connection.end();
    return rows;
}

async function getHistoryJob(karKode, startDate, endDate) {
    const connection = await mysql.createConnection(dbConfig);

    const sql = `
        SELECT 
            a.id,
            DATE_FORMAT(a.tanggal, '%d-%m-%Y') as tanggal,
            REPLACE(a.tujuan, '\\n', '') as tujuan,
            CONCAT(a.jamawal, ' s/d ', IFNULL(a.jamakhir, '')) as jam,
            CONCAT(b.keterangan, ' ', a.noplat) as keterangan
        FROM tkegiatan a 
        INNER JOIN tkendaraan b ON a.noplat = b.noplat
        WHERE a.tanggal BETWEEN ? AND ?
        AND a.kar_kode = ?
        ORDER BY a.tanggal DESC
    `;

    const [rows] = await connection.execute(sql, [startDate, endDate, karKode]);

    await connection.end();
    return rows;
}

module.exports = {
    getAllActive,
    getHistoryJob // Ekspor fungsi baru
};
