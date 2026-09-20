// services/auth.service.js

const pool = require("../config/db.config");

async function login(username, password) {
  // Query aman menggunakan prepared statements
  const sql =
    "SELECT kar_kode, kar_nama, kar_isdriver FROM tkaryawan WHERE kar_kode = ? AND kar_password = ?";

  const [rows] = await pool.execute(sql, [username, password]);

  // Kembalikan data pengguna jika ditemukan, jika tidak kembalikan null
  return rows.length > 0 ? rows[0] : null;
}

async function getPasswordByKode(kode) {
  const sql = "SELECT kar_password FROM tkaryawan WHERE kar_kode = ?";
  const [rows] = await pool.execute(sql, [kode]);
  return rows.length > 0 ? rows[0] : null;
}

async function changePassword(kode, oldPassword, newPassword) {
  // Satu query atomik: password hanya berubah jika kode + password lama cocok
  const sql =
    "UPDATE tkaryawan SET kar_password = ? WHERE kar_kode = ? AND kar_password = ?";
  const [result] = await pool.execute(sql, [newPassword, kode, oldPassword]);
  return result.affectedRows > 0;
}

module.exports = {
  login,
  getPasswordByKode,
  changePassword,
};
