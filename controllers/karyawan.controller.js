// controllers/karyawan.controller.js

const { get } = require('../routes/version.routes');
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

async function getOpenJobs(req, res) {
    const karKode = req.params.kar_kode;
    try {
        const jobList = await karyawanService.getOpenJobsByKaryawan(karKode);
        res.json({ success: true, data: jobList });
    } catch (error) {
        console.error("Controller Error:", error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data pekerjaan.' });
    }
}

async function getDrivers(req, res) {
    const searchTerm = req.query.query || '';
    try {
        const driverList = await karyawanService.getDrivers(searchTerm);
        res.json({ success: true, data: driverList });
    } catch (error) {
        console.error("Controller Error:", error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data driver' });
    }
}

module.exports = {
    getAllKaryawan,
    getHistoryJob,
    getOpenJobs,
    getDrivers
};
