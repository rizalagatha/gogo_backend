// services/kegiatan.service.js

const mysql = require('mysql2/promise');
const dbConfig = require('../config/db.config');
const { get } = require('../routes/version.routes');

async function checkOpenJob(userKode) {
    const connection = await mysql.createConnection(dbConfig);

    const sql = "SELECT id FROM tkegiatan WHERE kar_kode = ? AND jamakhir IS NULL LIMIT 1";

    const [rows] = await connection.execute(sql, [userKode]);

    await connection.end();

    return rows.length > 0 ? rows[0] : null;
}

async function getCheckoutFormData(userKode, nomorMinta) {
    const connection = await mysql.createConnection(dbConfig);

    const sql = "SELECT noplat, tujuan, isplan, nomor_minta FROM tkegiatan WHERE kar_kode = ? AND nomor_minta = ? AND jamakhir IS NULL";

    const [rows] = await connection.execute(sql, [userKode, nomorMinta]);

    await connection.end();

    return rows.length > 0 ? rows[0] : null;
}

async function getKegiatanDetail(kegiatanId) {
    const connection = await mysql.createConnection(dbConfig);

    // Query 1: Get main activity data
    const sql_main = `
        SELECT 
            noplat, 
            tujuan, 
            IF(isplan=0, 'Terjadwal', 'Tidak Terjadwal') as isplan, 
            keterangan, 
            kar_nama 
        FROM tkegiatan a 
        INNER JOIN tkaryawan b ON a.kar_kode = b.kar_kode 
        WHERE a.id = ?
    `;
    const [main_rows] = await connection.execute(sql_main, [kegiatanId]);

    // Query 2: Get sub-details
    const sql_details = `
        SELECT id, header_id, customer, latitude, longitude, jam 
        FROM tkegiatan_dtl 
        WHERE header_id = ?
    `;
    const [sub_details_rows] = await connection.execute(sql_details, [kegiatanId]);

    await connection.end();

    return {
        main_data: main_rows.length > 0 ? main_rows[0] : null,
        sub_details: sub_details_rows
    };
}

async function getKegiatanInfo(kegiatanId) {
    const connection = await mysql.createConnection(dbConfig);

    const sql = `
        SELECT 
            t.noplat, 
            t.tujuan, 
            t.isplan, 
            p.pd_customer 
        FROM tkegiatan t
        LEFT JOIN tpermintaandriver p ON t.nomor_minta = p.pd_nomor
        WHERE t.id = ? AND t.jamakhir IS NULL
    `;

    const [rows] = await connection.execute(sql, [kegiatanId]);

    await connection.end();
    return rows.length > 0 ? rows[0] : null;
}

async function submitCheckin(checkinData) {
    const connection = await mysql.createConnection(dbConfig);

    const sql = `
        INSERT INTO tkegiatan (tanggal, kar_kode, noplat, tujuan, isplan, nomor_minta, jamawal) 
        VALUES (NOW(), ?, ?, ?, ?, ?, NOW())
    `;

    const [result] = await connection.execute(sql, [
        checkinData.kar_kode,
        checkinData.noplat,
        checkinData.tujuan,
        checkinData.isplan,
        checkinData.nomor_minta
    ]);

    await connection.end();
    return result;
}

async function submitCheckout(checkoutData) {
    const connection = await mysql.createConnection(dbConfig);

    try {
        await connection.beginTransaction();

        // 1. Update tkegiatan
        let sql1 = `
      UPDATE tkegiatan 
      SET tanggal2 = NOW(), jamakhir = NOW(), keterangan = ?, standby = ?
    `;

        const params1 = [
            checkoutData.keterangan,
            checkoutData.standby,
        ];

        if (checkoutData.fotoPath) {
            sql1 += ", foto = ?";
            params1.push(checkoutData.fotoPath); // simpan nama file, bukan buffer
        }

        sql1 += " WHERE kar_kode = ? AND nomor_minta = ? AND jamakhir IS NULL";
        params1.push(checkoutData.kar_kode, checkoutData.nomor_minta);

        await connection.execute(sql1, params1);

        // 2. Update tpermintaandriver
        const sql2 = "UPDATE tpermintaandriver SET pd_isclosed = 1 WHERE pd_nomor = ?";
        await connection.execute(sql2, [checkoutData.nomor_minta]);

        await connection.commit();
        return { success: true };

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        await connection.end();
    }
}

async function submitKegiatanDetail(detailData) {
    const connection = await mysql.createConnection(dbConfig);

    try {
        await connection.beginTransaction();

        // 1. Dapatkan ID baru untuk tkegiatan_dtl
        const [idRows] = await connection.execute("SELECT IFNULL(MAX(id), 0) + 1 as new_id FROM tkegiatan_dtl");
        const newId = idRows[0].new_id;

        // 2. Insert data baru
        const sql = `
            INSERT INTO tkegiatan_dtl (id, header_id, customer, latitude, longitude, jam, foto) 
            VALUES (?, ?, ?, ?, ?, NOW(), ?)
        `;

        await connection.execute(sql, [
            newId,
            detailData.header_id,
            detailData.customer,
            detailData.latitude,
            detailData.longitude,
            detailData.foto_path
        ]);

        await connection.commit();
        return { success: true };

    } catch (error) {
        await connection.rollback();
        // Log error asli dari database untuk debugging
        console.error("Service/Database Error:", error); 
        throw error;
    } finally {
        await connection.end();
    }
}

async function getDetailsByKegiatanId(kegiatanId) {
    const connection = await mysql.createConnection(dbConfig);
    
    // Asumsi: tabel 'tkegiatan_dtl' memiliki kolom 'kegiatan_id' sebagai foreign key
    // yang merujuk ke 'tkegiatan.id'. Sesuaikan nama kolom jika berbeda.
    const sql = `
        SELECT 
            id,
            customer,
            foto,
            latitude,
            longitude
        FROM 
            tkegiatan_dtl 
        WHERE 
            kegiatan_id = ?
    `;

    try {
        const [rows] = await connection.execute(sql, [kegiatanId]);
        return rows;
    } finally {
        await connection.end();
    }
}

module.exports = {
    checkOpenJob,
    getCheckoutFormData,
    getKegiatanDetail,
    getKegiatanInfo,
    submitCheckin,
    submitCheckout,
    submitKegiatanDetail,
    getDetailsByKegiatanId
};
