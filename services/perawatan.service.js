// services/perawatan.service.js

const pool = require("../config/db.config");

// Fungsi untuk mengambil data yang dibutuhkan form input perawatan
async function getFormData() {
  const sql = "SELECT id, Jenis_perawatan FROM tjenisperawatan ORDER BY id";
  const [rows] = await pool.execute(sql);
  return rows;
}

// Tambahkan fungsi layanan perawatan lain di sini nanti
async function submitPerawatan(perawatanData) {
  const sql = `
        INSERT INTO tperawatan (nopol, km, tanggal, jenis_perawatan, note, bengkel, biaya) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

  const [result] = await pool.execute(sql, [
    perawatanData.nopol,
    perawatanData.km,
    perawatanData.tanggal,
    perawatanData.jenis_perawatan_id,
    perawatanData.note,
    perawatanData.bengkel,
    perawatanData.biaya,
  ]);

  return result;
}

module.exports = {
  getFormData,
  submitPerawatan,
};
