// services/notifications.service.js

const mysql = require('mysql2/promise');
const dbConfig = require('../config/db.config');

async function getNewNotifications(userKode) {
    const connection = await mysql.createConnection(dbConfig);
    
    try {
        // Mulai transaksi
        await connection.beginTransaction();

        // 1. SELECT: Ambil jadwal baru yang belum dinotifikasikan
        const sql_select = `
            SELECT kar_nama, tujuan, noplat, jamawal 
            FROM tkegiatan a 
            INNER JOIN tkaryawan b ON a.kar_kode = b.kar_kode
            WHERE 
                a.jamawal > (SELECT kar_tglnotification FROM tkaryawan WHERE kar_kode = ?)
                AND a.Tanggal = CURDATE()
                AND a.kar_kode = ?
        `;
        const [notifications] = await connection.execute(sql_select, [userKode, userKode]);

        // 2. UPDATE: Perbarui timestamp notifikasi terakhir untuk user ini
        const sql_update = "UPDATE tkaryawan SET kar_tglnotification = NOW() WHERE kar_kode = ?";
        await connection.execute(sql_update, [userKode]);

        // Jika semua berhasil, commit transaksi
        await connection.commit();

        return notifications;

    } catch (error) {
        // Jika ada error, batalkan semua perubahan
        await connection.rollback();
        // Lemparkan error agar bisa ditangkap oleh controller
        throw error;
    } finally {
        // Selalu tutup koneksi
        await connection.end();
    }
}

module.exports = {
    getNewNotifications
};
