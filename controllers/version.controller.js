// controllers/version.controller.js

const versionService = require('../services/version.service');

async function getVersion(req, res) {
    try {
        const result = await versionService.getAppVersion();

        if (result) {
            // Jika versi ditemukan, kirim respons sukses
            res.json({ success: true, version: result.versi });
        } else {
            // Jika tidak ditemukan, kirim pesan error
            res.status(404).json({ success: false, message: 'Informasi versi tidak ditemukan.' });
        }
    } catch (error) {
        console.error("Controller Error:", error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data versi' });
    }
}

module.exports = {
    getVersion
};
