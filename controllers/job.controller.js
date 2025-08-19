// controllers/job.controller.js

const jobService = require('../services/job.service');

async function getAllBatalJobs(req, res) {
    try {
        const jobList = await jobService.getBatalJobs();
        res.json({ success: true, data: jobList });
    } catch (error) {
        console.error("Controller Error:", error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data job batal' });
    }
}

async function getCheckoutList(req, res) {
    const driverName = req.query.driver_name;

    if (!driverName) {
        return res.status(400).json({ success: false, message: 'Nama driver tidak boleh kosong.' });
    }

    try {
        const jobList = await jobService.getCheckoutList(driverName);
        res.json({ success: true, data: jobList });
    } catch (error) {
        console.error("Controller Error:", error);
        res.status(500).json({ success: false, message: 'Gagal mengambil daftar check out' });
    }
}

async function getAllActiveJobs(req, res) {
    try {
        const jobList = await jobService.getActiveJobs();
        res.json({ success: true, data: jobList });
    } catch (error) {
        console.error("Controller Error:", error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data daftar job' });
    }
}

async function getJobDetail(req, res) {
    const nomorJob = req.params.nomor_job;

    if (!nomorJob) {
        return res.status(400).json({ success: false, message: 'Nomor job tidak boleh kosong.' });
    }

    try {
        const detailList = await jobService.getJobDetail(nomorJob);
        res.json({ success: true, data: detailList });
    } catch (error) {
        console.error("Controller Error:", error);
        res.status(500).json({ success: false, message: 'Gagal mengambil detail pekerjaan' });
    }
}

module.exports = {
    getAllBatalJobs,
    getCheckoutList,
    getAllActiveJobs,
    getJobDetail
};
