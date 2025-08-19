// services/job.service.js

const mysql = require('mysql2/promise');
const dbConfig = require('../config/db.config');

async function getBatalJobs() {
    const connection = await mysql.createConnection(dbConfig);
    
    const sql = `
        SELECT
            pd_nomor,
            pd_customer,
            pd_tipejadwal,
            pd_uraian,
            TIME_FORMAT(pd_jamkerja, '%H:%i') as pd_jamkerja,
            pd_userpeminta,
            'Batal' as status,
            pd_driver,
            DATE_FORMAT(pd_tglkerja, '%d-%m-%Y') as pd_tglKerja
        FROM tpermintaandriver 
        WHERE pd_isclosed = 4
        ORDER BY pd_tanggal DESC
    `;
    
    const [rows] = await connection.execute(sql);

    await connection.end();
    return rows;
}

// Tambahkan fungsi layanan job lain di sini nanti
async function getCheckoutList(driverName) {
    const connection = await mysql.createConnection(dbConfig);

    const sql = `
        SELECT 
            pd_nomor,
            pd_tipejadwal,
            CONCAT(pd_customer, ' => ', pd_uraian) as uraian,
            pd_jamkerja,
            pd_userpeminta,
            DATE_FORMAT(pd_tglkerja, '%Y-%m-%d') as pd_tglKerja
        FROM tpermintaandriver 
        WHERE pd_isclosed <> 1 
        AND pd_tglkerja <= CURDATE()
        AND pd_driver = ?
        ORDER BY pd_tanggal
    `;

    const [rows] = await connection.execute(sql, [driverName]);

    await connection.end();
    return rows;
}

async function getActiveJobs() {
    const connection = await mysql.createConnection(dbConfig);

    const sql = `
        SELECT
            pd_nomor,
            pd_customer,
            pd_tipejadwal,
            pd_uraian,
            pd_jamkerja,
            pd_userpeminta,
            IF(pd_isclosed = 0, 'Belum', 'Proses') as status,
            pd_driver,
            DATE_FORMAT(pd_tglkerja, '%d-%m-%Y') as pd_tglKerja,
            pd_pengambilan,
            pd_pic
        FROM tpermintaandriver 
        WHERE pd_isclosed NOT IN (1, 4) 
        AND pd_tanggal <= CURDATE() 
        ORDER BY pd_tglkerja
    `;

    const [rows] = await connection.execute(sql);

    await connection.end();
    return rows;
}

async function getJobDetail(nomorJob) {
    const connection = await mysql.createConnection(dbConfig);

    const sql = `
        SELECT 
            pdd_nomor,
            pdd_nourut,
            pdd_spk,
            pdd_ket,
            pdd_penerima
        FROM tpermintaandriver_dtl
        WHERE pdd_nomor = ?
    `;

    const [rows] = await connection.execute(sql, [nomorJob]);

    await connection.end();
    return rows;
}

module.exports = {
    getBatalJobs,
    getCheckoutList,
    getActiveJobs,
    getJobDetail
};
