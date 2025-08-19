// controllers/kendaraan.controller.js

const { get } = require('../routes/version.routes');
const kendaraanService = require('../services/kendaraan.service');

// Kontroler untuk mendapatkan data yang dibutuhkan form Check In
async function getCheckinData(req, res) {
    try {
        const kendaraanList = await kendaraanService.getAllNoplat();
        
        res.json({ 
            success: true, 
            kendaraan: kendaraanList 
        });

    } catch (error) {
        console.error("Controller Error:", error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data check-in' });
    }
}

async function getHistoryPerawatan(req, res) {
    const noplat = req.params.noplat;
    const { start_date, end_date } = req.query;

    if (!noplat) {
        return res.status(400).json({ success: false, message: 'Nomor Polisi (noplat) tidak boleh kosong.' });
    }

    try {
        const historyList = await kendaraanService.getHistoryPerawatan(noplat, start_date, end_date);
        res.json({ success: true, data: historyList });
    } catch (error) {
        console.error("Controller Error:", error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data riwayat perawatan' });
    }
}

async function getAllKendaraan(req, res) {
    try {
        const kendaraanList = await kendaraanService.getAllKendaraan();
        res.json({ success: true, data: kendaraanList });
    } catch (error) {
        console.error("Controller Error:", error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data kendaraan' });
    }
}

async function searchKendaraan(req, res) {
    const searchQuery = req.query.query || '';

    try {
        const kendaraanList = await kendaraanService.searchKendaraan(searchQuery);
        res.json({ success: true, data: kendaraanList });
    } catch (error) {
        console.error("Controller Error:", error);
        res.status(500).json({ success: false, message: 'Gagal mencari kendaraan' });
    }
}

module.exports = {
    getCheckinData,
    getHistoryPerawatan,
    getAllKendaraan,
    searchKendaraan
};
