// File: services/visit.service.js

const pool = require("../config/db.config");

/**
 * Mengambil detail data kunjungan dari database berdasarkan ID.
 * Query ini diadaptasi dari kode Delphi ufrmDetailVisit.
 * @param {number} visitId - ID dari detail kegiatan (tkegiatan_dtl).
 * @returns {Promise<object|null>} - Mengembalikan objek detail kunjungan atau null jika tidak ditemukan.
 */
async function getDetailById(visitId) {
  // Query yang diambil dari Delphi dan diubah menjadi parameterized query
  // untuk keamanan (mencegah SQL Injection).
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
            id = ?
    `;

  // Menjalankan query dengan ID yang diberikan
  const [rows] = await pool.execute(sql, [visitId]);

  // Mengembalikan baris pertama jika ada, jika tidak, null.
  return rows.length > 0 ? rows[0] : null;
}

module.exports = {
  getDetailById,
};
