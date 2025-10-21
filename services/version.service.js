// services/version.service.js

const pool = require("../config/db.config");

async function getAppVersion() {
  const sql = "SELECT versi FROM tversi WHERE aplikasi = ?";

  // Eksekusi query dengan parameter 'GOGO'
  const [rows] = await pool.execute(sql, ["GOGO"]);

  // Kembalikan baris pertama yang ditemukan, atau null jika tidak ada
  return rows.length > 0 ? rows[0] : null;
}

module.exports = {
  getAppVersion,
};
