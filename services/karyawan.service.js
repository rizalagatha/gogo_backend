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

async function getOpenJobsByKaryawan(karKode) {
    const connection = await mysql.createConnection(dbConfig);
    
    // Query untuk mengambil kegiatan yang "sedang berjalan" atau siap diupdate
    const sql = `
        SELECT 
            pd_nomor as id,
            pd_uraian as tujuan
        FROM tpermintaandriver
        WHERE pd_driver = ? 
        AND pd_isClosed = 2
        ORDER BY pd_tanggal DESC
    `;

    try {
        const [rows] = await connection.execute(sql, [karKode]);
        return rows;
    } catch (error) {
        console.error('[FATAL] Terjadi error saat menjalankan query getOpenJobs:', error);
        throw error;
    } 
    finally {
        await connection.end();
    }
}

module.exports = {
    getAllActive,
    getHistoryJob,
    getOpenJobsByKaryawan // Ekspor fungsi baru
};
