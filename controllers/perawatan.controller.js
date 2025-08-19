// controllers/perawatan.controller.js

const perawatanService = require('../services/perawatan.service');

async function getFormData(req, res) {
    try {
        const jenisPerawatanList = await perawatanService.getFormData();
        res.json({ success: true, data: jenisPerawatanList });
    } catch (error) {
        console.error("Controller Error:", error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data form perawatan' });
    }
}

async function submitPerawatan(req, res) {
    try {
        const result = await perawatanService.submitPerawatan(req.body);
        res.json({ success: true, message: 'Data perawatan berhasil disimpan.' });
    } catch (error) {
        console.error("Controller Error:", error);
        res.status(500).json({ success: false, message: 'Gagal menyimpan data perawatan' });
    }
}

module.exports = {
    getFormData,
    submitPerawatan
};
