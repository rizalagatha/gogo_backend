// controllers/permintaan.controller.js

const permintaanService = require('../services/permintaan.service');

async function getFormData(req, res) {
    try {
        const { serverTime, maxKode } = await permintaanService.getFormData();

        // Generate new code based on the data from service
        const prefix = 'MND.' + new Date(serverTime).toISOString().slice(0, 7).replace('-', '') + '.';
        const nextNumber = parseInt(maxKode, 10) + 1;
        const newKode = prefix + String(nextNumber).padStart(4, '0');

        res.json({
            success: true,
            // [PERBAIKAN] Kirim waktu dalam format standar ISO 8601 (UTC)
            server_time: new Date(serverTime).toISOString(),
            new_kode: newKode
        });

    } catch (error) {
        console.error("Controller Error:", error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data form permintaan' });
    }
}

async function getSelectableJobs(req, res) {
    const searchQuery = req.query.query || '';

    try {
        const jobList = await permintaanService.getSelectableJobs(searchQuery);
        res.json({ success: true, data: jobList });
    } catch (error) {
        console.error("Controller Error:", error);
        res.status(500).json({ success: false, message: 'Gagal mengambil daftar pekerjaan' });
    }
}

async function submitPermintaan(req, res) {
    try {
        const result = await permintaanService.submitPermintaan(req.body);
        res.json({ success: true, message: 'Permintaan berhasil disimpan.' });
    } catch (error) {
        console.error("Controller Error:", error);
        res.status(500).json({ success: false, message: 'Gagal menyimpan data permintaan' });
    }
}

module.exports = {
    getFormData,
    getSelectableJobs,
    submitPermintaan
};
