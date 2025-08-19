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
    try {
        const mainSql = `
            SELECT 
                a.id,
                a.nomor_minta,
                a.noplat,
                a.tujuan,
                IF(a.isplan = 0, 'Terjadwal', 'Tidak Terjadwal') AS status,
                a.keterangan,
                b.kar_nama AS namaDriver,
                c.pd_nomor,
                c.pd_tanggal,
                c.pd_customer
            FROM tkegiatan a
            LEFT JOIN tkaryawan b ON a.kar_kode = b.kar_kode
            LEFT JOIN tpermintaandriver c ON a.nomor_minta = c.pd_nomor
            WHERE a.id = ?
        `;
        const [mainRows] = await connection.execute(mainSql, [kegiatanId]);
        if (mainRows.length === 0) return null;

        const mainData = mainRows[0];

        const headerKey = mainData.pd_nomor || mainData.nomor_minta || mainData.id;

        const subSql = `
            SELECT id, customer, jam, latitude, longitude, foto
            FROM tkegiatan_dtl
            WHERE header_id = ?
        `;
        const [subRows] = await connection.execute(subSql, [headerKey]);

        // konversi Buffer foto jadi string filename
        const subDetails = subRows.map(row => ({
            ...row,
            foto: row.foto ? row.foto.toString() : null  // ⬅️ ini fix-nya
            // kalau mau full URL:
            // foto: row.foto ? `${process.env.APP_URL}/${process.env.UPLOAD_DIR}/${row.foto.toString()}` : null
        }));

        return { main_data: mainData, sub_details: subDetails };
    } finally {
        await connection.end();
    }
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
    console.log("[DEBUG] Data yang diterima oleh service:", detailData);
    const connection = await mysql.createConnection(dbConfig);

    try {
        await connection.beginTransaction();

        const latitude = detailData.latitude === '' ? null : detailData.latitude;
        const longitude = detailData.longitude === '' ? null : detailData.longitude;

        if (detailData.id) {
            // === UPDATE jika ada id
            const sql = `
                UPDATE tkegiatan_dtl 
                SET customer = ?, latitude = ?, longitude = ?, foto = ?, jam = NOW()
                WHERE id = ?
            `;
            const params = [detailData.customer, latitude, longitude, detailData.foto_path, detailData.id];
            console.log("[DEBUG] Parameter untuk query UPDATE:", params);
            await connection.execute(sql, params);

            console.log(`[SUCCESS] Data dengan ID ${detailData.id} berhasil diupdate`);
        } else {
            // === INSERT baru
            const [idRows] = await connection.execute("SELECT IFNULL(MAX(id), 0) + 1 as new_id FROM tkegiatan_dtl");
            const newId = idRows[0].new_id;

            const sql = `
                INSERT INTO tkegiatan_dtl (id, header_id, customer, latitude, longitude, jam, foto) 
                VALUES (?, ?, ?, ?, ?, NOW(), ?)
            `;
            const params = [newId, detailData.header_id, detailData.customer, latitude, longitude, detailData.foto_path];
            console.log("[DEBUG] Parameter untuk query INSERT:", params);
            await connection.execute(sql, params);

            console.log(`[SUCCESS] Data baru berhasil disimpan dengan ID ${newId}`);
        }

        await connection.commit();
        return { success: true };
    } catch (error) {
        await connection.rollback();
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
