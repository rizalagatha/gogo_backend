// controllers/monitoring.controller.js

const monitoringService = require('../services/monitoring.service');

async function getMonitoringData(req, res) {
    try {
        const monitoringList = await monitoringService.getMonitoringData();
        res.json({ success: true, data: monitoringList });
    } catch (error) {
        console.error("Controller Error:", error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data monitoring' });
    }
}

module.exports = {
    getMonitoringData
};
