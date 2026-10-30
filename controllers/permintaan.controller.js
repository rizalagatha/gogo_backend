// controllers/permintaan.controller.js

const permintaanService = require("../services/permintaan.service");

async function getFormData(req, res) {
  try {
    const { serverTime } = await permintaanService.getFormData();

    res.json({
      success: true,
      server_time: new Date(serverTime).toISOString(),
      // Hanya untuk APK lama yang masih membaca field ini. Nomor asli
      // dibuat saat simpan. Hapus baris ini setelah semua user update.
      new_kode: "Otomatis",
    });
  } catch (error) {
    console.error("Controller Error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Gagal mengambil data form permintaan",
      });
  }
}

async function submitPermintaan(req, res) {
  const body = req.body || {};

  const wajib = {
    pd_pengambilan: "Pengambilan",
    pd_customer: "Customer",
    pd_pic: "PIC",
    pd_jamkerja: "Jam kerja",
  };
  for (const [field, label] of Object.entries(wajib)) {
    if (!String(body[field] || "").trim()) {
      return res
        .status(400)
        .json({ success: false, message: `${label} tidak boleh kosong.` });
    }
  }

  try {
    // pd_nomor dari client (APK lama) diabaikan; server membuat sendiri
    const { nomor } = await permintaanService.submitPermintaan(body);
    res.json({
      success: true,
      message: "Permintaan berhasil disimpan.",
      nomor,
    });
  } catch (error) {
    console.error("Controller Error:", error);
    const status = error.statusCode || 500;
    res.status(status).json({
      success: false,
      message:
        status === 500 ? "Gagal menyimpan data permintaan" : error.message,
    });
  }
}

async function searchSpk(req, res) {
  const keyword = String(req.query.query || "").trim();
  if (keyword.length < 2) {
    return res.json({ success: true, data: [] });
  }

  try {
    const data = await permintaanService.searchSpk(keyword);
    res.json({ success: true, data });
  } catch (error) {
    console.error("Controller Error:", error);
    res.status(500).json({ success: false, message: "Gagal mencari SPK" });
  }
}

module.exports = {
  getFormData,
  getSelectableJobs,
  submitPermintaan,
  searchSpk,
};
