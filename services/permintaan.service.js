// services/permintaan.service.js

const mysql = require('mysql2/promise');
const dbConfig = require('../config/db.config');

// Fungsi untuk mengambil data yang dibutuhkan form input permintaan
async function getFormData() {
    const connection = await mysql.createConnection(dbConfig);
    
    // 1. Get Server Time
    const [timeRows] = await connection.execute("SELECT NOW() as server_time");
    const serverTime = timeRows[0].server_time;

    // 2. Get Max Kode
    const prefix = 'MND.' + new Date(serverTime).toISOString().slice(0, 7).replace('-', '') + '.';
    const sql_kode = "SELECT IFNULL(MAX(CAST(RIGHT(pd_nomor, 4) AS UNSIGNED)), 0) as max_kode FROM tpermintaandriver WHERE pd_nomor LIKE ?";
    const [kodeRows] = await connection.execute(sql_kode, [prefix + '%']);
    
    await connection.end();

    return {
        serverTime: serverTime,
        maxKode: kodeRows[0].max_kode
    };
}

async function getSelectableJobs(searchQuery) {
    const connection = await mysql.createConnection(dbConfig);

    const sql = `
        SELECT 
            pd_nomor,
            pd_tipejadwal,
            pd_customer,
            pd_uraian
        FROM tpermintaandriver 
        WHERE pd_isclosed = 0 
        AND pd_tglkerja <= CURDATE()
        AND (pd_nomor LIKE ? OR pd_customer LIKE ? OR pd_uraian LIKE ?)
        ORDER BY pd_tglkerja
    `;

    const queryParam = `%${searchQuery}%`;
    const [rows] = await connection.execute(sql, [queryParam, queryParam, queryParam]);

    await connection.end();
    return rows;
}

async function submitPermintaan(permintaanData) {
    const connection = await mysql.createConnection(dbConfig);

    const sql = `
        INSERT INTO tpermintaandriver 
            (pd_nomor, pd_tanggal, pd_tipejadwal, pd_pengambilan, pd_customer, pd_pic, pd_uraian, pd_jamkerja, pd_status, pd_jamminta, pd_userpeminta, pd_tglkerja) 
        VALUES 
            (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await connection.execute(sql, [
        permintaanData.pd_nomor,
        permintaanData.pd_tanggal,
        permintaanData.pd_tipejadwal,
        permintaanData.pd_pengambilan,
        permintaanData.pd_customer,
        permintaanData.pd_pic,
        permintaanData.pd_uraian,
        permintaanData.pd_jamkerja,
        permintaanData.pd_status,
        permintaanData.pd_jamminta,
        permintaanData.pd_userpeminta,
        permintaanData.pd_tglkerja
    ]);

    await connection.end();
    return result;
}

module.exports = {
    getFormData,
    getSelectableJobs,
    submitPermintaan
};
