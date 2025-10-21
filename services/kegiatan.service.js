// services/kegiatan.service.js

const pool = require("../config/db.config");

async function checkOpenJob(userKode) {
  const sql =
    "SELECT id FROM tkegiatan WHERE kar_kode = ? AND jamakhir IS NULL LIMIT 1";
  const [rows] = await pool.execute(sql, [userKode]);
  return rows.length > 0 ? rows[0] : null;
}

async function getCheckoutFormData(userKode, nomorMinta) {
  const sql =
    "SELECT noplat, tujuan, isplan, nomor_minta FROM tkegiatan WHERE kar_kode = ? AND nomor_minta = ? AND jamakhir IS NULL";
  const [rows] = await pool.execute(sql, [userKode, nomorMinta]);
  return rows.length > 0 ? rows[0] : null;
}

async function getKegiatanDetail(kegiatanId) {
  const connection = await pool.getConnection();
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

    const subSql = `
            SELECT id, customer, jam, latitude, longitude, foto
            FROM tkegiatan_dtl
            WHERE header_id = ?
        `;
    const [subRows] = await connection.execute(subSql, [kegiatanId]);

    // konversi Buffer foto jadi string filename
    const subDetails = subRows.map((row) => ({
      ...row,
      foto: row.foto ? row.foto.toString() : null,
    }));

    return { main_data: mainData, sub_details: subDetails };
  } finally {
    connection.release();
  }
}

async function getKegiatanInfo(kegiatanId) {
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

  const [rows] = await pool.execute(sql, [kegiatanId]);
  return rows.length > 0 ? rows[0] : null;
}

async function submitCheckin(checkinData) {
  const sql = `
        INSERT INTO tkegiatan (tanggal, kar_kode, noplat, tujuan, isplan, nomor_minta, jamawal) 
        VALUES (NOW(), ?, ?, ?, ?, ?, NOW())
    `;

  const [result] = await pool.execute(sql, [
    checkinData.kar_kode,
    checkinData.noplat,
    checkinData.tujuan,
    checkinData.isplan,
    checkinData.nomor_minta,
  ]);

  return result;
}

async function submitCheckout(checkoutData) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    let sql1 = `
            UPDATE tkegiatan 
            SET tanggal2 = NOW(), jamakhir = NOW(), keterangan = ?, standby = ?
        `;
    const params1 = [checkoutData.keterangan, checkoutData.standby];
    if (checkoutData.fotoPath) {
      sql1 += ", foto = ?";
      params1.push(checkoutData.fotoPath);
    }
    sql1 += " WHERE kar_kode = ? AND nomor_minta = ? AND jamakhir IS NULL";
    params1.push(checkoutData.kar_kode, checkoutData.nomor_minta);
    await connection.execute(sql1, params1);

    const sql2 = `
            UPDATE tpermintaandriver 
            SET pd_isclosed = 1, pd_penerima = ? 
            WHERE pd_nomor = ?
        `;
    await connection.execute(sql2, [
      checkoutData.penerima,
      checkoutData.nomor_minta,
    ]);

    await connection.commit();
    return { success: true };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function submitKegiatanDetail(detailData) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const latitude = detailData.latitude === "" ? null : detailData.latitude;
    const longitude = detailData.longitude === "" ? null : detailData.longitude;

    if (detailData.id) {
      // === UPDATE jika ada id
      const sql = `
                UPDATE tkegiatan_dtl 
                SET customer = ?, latitude = ?, longitude = ?, foto = ?, jam = NOW()
                WHERE id = ?
            `;
      const params = [
        detailData.customer,
        latitude,
        longitude,
        detailData.foto_path,
        detailData.id,
      ];
      await connection.execute(sql, params);
    } else {
      // === INSERT baru
      const [idRows] = await connection.execute(
        "SELECT IFNULL(MAX(id), 0) + 1 as new_id FROM tkegiatan_dtl"
      );
      const newId = idRows[0].new_id;

      const sql = `
                INSERT INTO tkegiatan_dtl (id, header_id, customer, latitude, longitude, jam, foto) 
                VALUES (?, ?, ?, ?, ?, NOW(), ?)
            `;
      const params = [
        newId,
        detailData.header_id,
        detailData.customer,
        latitude,
        longitude,
        detailData.foto_path,
      ];
      await connection.execute(sql, params);
    }

    await connection.commit();
    return { success: true };
  } catch (error) {
    await connection.rollback();
    console.error("Service/Database Error:", error);
    throw error;
  } finally {
    connection.release();
  }
}

async function getDetailsByKegiatanId(kegiatanId) {
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

  const [rows] = await pool.execute(sql, [kegiatanId]);
  return rows;
}

module.exports = {
  checkOpenJob,
  getCheckoutFormData,
  getKegiatanDetail,
  getKegiatanInfo,
  submitCheckin,
  submitCheckout,
  submitKegiatanDetail,
  getDetailsByKegiatanId,
};
