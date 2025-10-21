// services/kendaraan.service.js

const pool = require("../config/db.config");

// Fungsi untuk mengambil semua nomor plat kendaraan
async function getAllNoplat() {
  const sql = "SELECT noplat FROM tkendaraan ORDER BY noplat";
  const [rows] = await pool.execute(sql);

  // Mengubah array objek menjadi array string, mirip PDO::FETCH_COLUMN
  return rows.map((row) => row.noplat);
}

async function getHistoryPerawatan(nopol, startDate, endDate) {
  const sql = `
        SELECT
            IFNULL(b.jenis_perawatan, 'Lainnya') as tujuan,
            DATE_FORMAT(a.tanggal, '%d-%m-%Y') as tanggal,
            a.bengkel,
            a.biaya,
            a.KM
        FROM tperawatan a
        LEFT JOIN tjenisperawatan b ON a.jenis_perawatan = b.id
        WHERE a.tanggal BETWEEN ? AND ?
        AND a.nopol = ?
        ORDER BY a.tanggal DESC
    `;

  const [rows] = await pool.execute(sql, [startDate, endDate, nopol]);
  return rows;
}

async function getAllKendaraan() {
  const sql = "SELECT noplat, keterangan FROM tkendaraan";
  const [rows] = await pool.execute(sql);
  return rows;
}

async function searchKendaraan(searchQuery) {
  const sql =
    "SELECT noplat FROM tkendaraan WHERE noplat LIKE ? ORDER BY noplat";
  const [rows] = await pool.execute(sql, [`%${searchQuery}%`]);
  return rows.map((row) => row.noplat);
}

module.exports = {
  getAllNoplat,
  getHistoryPerawatan,
  getAllKendaraan,
  searchKendaraan,
};
