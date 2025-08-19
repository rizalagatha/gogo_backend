// services/monitoring.service.js

const mysql = require('mysql2/promise');
const dbConfig = require('../config/db.config');

async function getMonitoringData() {
    const connection = await mysql.createConnection(dbConfig);
    
    // Query yang sudah dioptimalkan dari get_monitoring.php
    const sql = `
        SELECT 
            k.kar_nama,
            IF(
                t.jamakhir IS NULL AND t.id IS NOT NULL,
                CONCAT(REPLACE(t.tujuan, '\\n', ''), '\\r\\n', 'Jam : ', t.jamawal, ' -> ', t.noplat),
                CONCAT('FREE', '\\r\\n', IFNULL(t.standby, ''))
            ) as keterangan
        FROM 
            tkaryawan k
        LEFT JOIN (
            SELECT kar_kode, MAX(id) as max_id
            FROM tkegiatan
            GROUP BY kar_kode
        ) last_kegiatan ON k.kar_kode = last_kegiatan.kar_kode
        LEFT JOIN tkegiatan t ON t.id = last_kegiatan.max_id
        WHERE 
            k.kar_aktif = 0
    `;
    
    const [rows] = await connection.execute(sql);

    await connection.end();
    return rows;
}

module.exports = {
    getMonitoringData
};
