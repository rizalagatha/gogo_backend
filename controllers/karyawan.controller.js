// controllers/karyawan.controller.js

const karyawanService = require('../services/karyawan.service');

async function getAllKaryawan(req, res) {
    try {
        const karyawanList = await karyawanService.getAllActive();
        res.json({ success: true, data: karyawanList });
    } catch (error) {
        console.error("Controller Error:", error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data karyawan' });
    }
}

// [PERUBAHAN] Fungsi baru ditambahkan di sini
async function getHistoryJob(req, res) {
    const karKode = req.params.kar_kode;
    const { start_date, end_date } = req.query;

    if (!karKode) {
        return res.status(400).json({ success: false, message: 'Kode Karyawan tidak boleh kosong.' });
    }

    try {
        const historyList = await karyawanService.getHistoryJob(karKode, start_date, end_date);
        res.json({ success: true, data: historyList });
    } catch (error) {
        console.error("Controller Error:", error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data history job' });
    }
}

module.exports = {
    getAllKaryawan,
    getHistoryJob // Ekspor fungsi baru
};
