// File: controllers/visit.controller.js

const visitService = require('../services/visit.service');

/**
 * Menangani request untuk mendapatkan detail visit berdasarkan ID.
 * @param {object} req - Objek request dari Express.
 * @param {object} res - Objek response dari Express.
 */
async function getVisitDetail(req, res) {
    const visitId = parseInt(req.params.id, 10);

    // Validasi sederhana untuk memastikan ID adalah angka
    if (isNaN(visitId)) {
        return res.status(400).json({ 
            success: false, 
            message: 'ID Kunjungan tidak valid.' 
        });
    }

    try {
        const detail = await visitService.getDetailById(visitId);

        if (detail) {
            // Jika data ditemukan, kirim sebagai JSON dengan status 200 OK
            res.json({ success: true, data: detail });
        } else {
            // Jika tidak ditemukan, kirim status 404 Not Found
            res.status(404).json({ 
                success: false, 
                message: 'Data kunjungan tidak ditemukan.' 
            });
        }
    } catch (error) {
        console.error("Controller Error:", error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan pada server saat mengambil data.' 
        });
    }
}

module.exports = {
    getVisitDetail
};
