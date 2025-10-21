// services/karyawan.service.js
const pool = require("../config/db.config");

async function getAllActive() {
  const sql =
    "SELECT kar_kode, kar_nama FROM tkaryawan WHERE kar_aktif = 0 ORDER BY kar_nama ASC";
  const [rows] = await pool.execute(sql);
  return rows;
}

async function getHistoryJob(karKode, startDate, endDate) {
  const sql = `
        SELECT 
            a.id,
            DATE_FORMAT(a.tanggal, '%d-%m-%Y') as tanggal,
            REPLACE(a.tujuan, '\\n', '') as tujuan,
            CONCAT(a.jamawal, ' s/d ', IFNULL(a.jamakhir, '')) as jam,
            CONCAT(b.keterangan, ' ', a.noplat) as keterangan
        FROM tkegiatan a 
        INNER JOIN tkendaraan b ON a.noplat = b.noplat
        WHERE a.tanggal BETWEEN ? AND ?
        AND a.kar_kode = ?
        ORDER BY a.tanggal DESC
    `;

  const [rows] = await pool.execute(sql, [startDate, endDate, karKode]);
  return rows;
}

async function getOpenJobsByKaryawan(karKode) {
  const sql = `
       SELECT 
            c.id,
            CONCAT(a.pd_customer, ' => ', a.pd_uraian) as tujuan,
            a.pd_customer as customer,
            a.pd_tipejadwal as status,
            c.noplat as noplat,
            DATE_FORMAT(a.pd_tglkerja, '%d-%m-%Y') as tglKerja, 
            a.pd_jamkerja as jamKerja                           
        FROM tpermintaandriver a
        JOIN tkaryawan b ON a.pd_driver = b.kar_nama
        JOIN tkegiatan c ON a.pd_nomor = c.nomor_minta
        WHERE b.kar_kode = ? 
        AND a.pd_isClosed = 2
        ORDER BY a.pd_tglKerja DESC
    `;

  const [rows] = await pool.execute(sql, [karKode]);
  return rows;
}

async function getDrivers(searchTerm) {
  const query = `%${searchTerm}%`;
  const sql = `
        SELECT kar_kode, kar_nama 
        FROM tkaryawan 
        WHERE 
            kar_aktif = 0 
            AND kar_isdriver = 1 
            AND (kar_kode LIKE ? OR kar_nama LIKE ?)
        ORDER BY kar_nama ASC
    `;

  const [rows] = await pool.execute(sql, [query, query]);
  return rows;
}

module.exports = {
  getAllActive,
  getHistoryJob,
  getOpenJobsByKaryawan,
  getDrivers,
};
