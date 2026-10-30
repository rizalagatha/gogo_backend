const pool = require("../config/db.config");

const LOCK_NAME = "gogo_permintaan_driver_nomor";

// Form hanya butuh waktu server. Nomor TIDAK dibuat di sini lagi.
async function getFormData() {
  const [rows] = await pool.execute("SELECT NOW() AS server_time");
  return { serverTime: rows[0].server_time };
}

// Dipanggil hanya dari dalam submitPermintaan (saat lock sudah dipegang).
async function generateNomor(conn) {
  // Prefix bulan diambil dari MySQL, bukan toISOString() (UTC),
  // supaya tidak salah bulan pada tanggal 1 dini hari.
  const [[{ ym }]] = await conn.query(
    "SELECT DATE_FORMAT(NOW(), '%Y%m') AS ym",
  );
  const prefix = `MND.${ym}.`;

  const [rows] = await conn.query(
    `SELECT IFNULL(MAX(CAST(RIGHT(pd_nomor, 4) AS UNSIGNED)), 0) AS max_kode
     FROM tpermintaandriver
     WHERE pd_nomor LIKE ?`,
    [`${prefix}%`],
  );

  const next = Number(rows[0].max_kode) + 1;
  return prefix + String(next).padStart(4, "0");
}

async function submitPermintaan(data) {
  const conn = await pool.getConnection();
  let locked = false;

  try {
    // Hanya satu proses yang boleh membuat nomor pada satu waktu.
    // Lock dipegang sampai COMMIT selesai, jadi proses berikutnya
    // selalu melihat nomor terakhir yang sudah tersimpan.
    const [lockRows] = await conn.query("SELECT GET_LOCK(?, 10) AS got", [
      LOCK_NAME,
    ]);
    if (Number(lockRows[0].got) !== 1) {
      const err = new Error("Server sedang sibuk, silakan coba lagi.");
      err.statusCode = 503;
      throw err;
    }
    locked = true;

    await conn.beginTransaction();

    const nomor = await generateNomor(conn);

    await conn.execute(
      `INSERT INTO tpermintaandriver
        (pd_nomor, pd_tanggal, pd_tipejadwal, pd_pengambilan, pd_customer, pd_pic,
         pd_uraian, pd_jamkerja, pd_status, pd_jamminta, pd_userpeminta, pd_tglkerja)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nomor,
        data.pd_tanggal,
        data.pd_tipejadwal,
        data.pd_pengambilan,
        data.pd_customer,
        data.pd_pic,
        data.pd_uraian,
        data.pd_jamkerja,
        data.pd_status,
        data.pd_jamminta,
        data.pd_userpeminta,
        data.pd_tglkerja,
      ],
    );

    // Detail: baris yang SPK dan keterangannya sama-sama kosong dilewati
    const items = Array.isArray(data.items) ? data.items : [];
    let nourut = 1;
    for (const item of items) {
      const spk = String(item.spk || "").trim();
      const ket = String(item.keterangan || "").trim();
      const penerima = String(item.penerima || "").trim();
      if (!spk && !ket) continue;

      await conn.execute(
        `INSERT INTO tpermintaandriver_dtl
          (pdd_nomor, pdd_nourut, pdd_spk, pdd_ket, pdd_penerima)
         VALUES (?, ?, ?, ?, ?)`,
        [nomor, nourut++, spk, ket, penerima],
      );
    }

    await conn.commit();
    return { nomor };
  } catch (error) {
    try {
      await conn.rollback();
    } catch (_) {}
    throw error;
  } finally {
    if (locked) {
      try {
        await conn.query("SELECT RELEASE_LOCK(?)", [LOCK_NAME]);
      } catch (_) {}
    }
    conn.release();
  }
}

// Pencarian SPK / Memo SPK / SO (sama dengan versi web)
async function searchSpk(keyword) {
  const term = `%${keyword}%`;
  const sql = `
    SELECT * FROM (
      SELECT spk_nomor AS Nomor, spk_nama AS Nama, 'SPK' AS Tipe
      FROM kencanaprint.tspk
      WHERE (spk_nomor LIKE ? OR spk_nama LIKE ?)
      UNION ALL
      SELECT mspk_nomor AS Nomor, mspk_nama AS Nama, 'MEMO' AS Tipe
      FROM kencanaprint.tmemospk
      WHERE (mspk_nomor LIKE ? OR mspk_nama LIKE ?)
      UNION ALL
      SELECT so_nomor AS Nomor, so_nama AS Nama, 'SO' AS Tipe
      FROM kencanaprint.tsalesorder
      WHERE (so_nomor LIKE ? OR so_nama LIKE ?)
    ) x
    ORDER BY (Nomor = ?) DESC, (Nomor LIKE ?) DESC, Nomor DESC
    LIMIT 50
  `;
  const [rows] = await pool.query(sql, [
    term,
    term,
    term,
    term,
    term,
    term,
    keyword,
    `${keyword}%`,
  ]);
  return rows;
}

module.exports = {
  getFormData,
  getSelectableJobs,
  submitPermintaan,
  searchSpk,
};
