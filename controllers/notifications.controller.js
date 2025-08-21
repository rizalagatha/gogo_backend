// controllers/notifications.controller.js

const { get } = require('../routes/version.routes');
const notificationsService = require('../services/notifications.service');

async function getNotifications(req, res) {
    const userKode = req.query.user_kode;

    if (!userKode) {
        return res.status(400).json({ success: false, message: 'user_kode tidak boleh kosong.' });
    }

    try {
        const notifications = await notificationsService.getNewNotifications(userKode);

        // Format data sesuai kebutuhan aplikasi Flutter
        const formattedNotifications = notifications.map(notif => ({
            title: `Jadwal Baru: ${notif.tujuan}`,
            body: `${notif.kar_nama} -> ${notif.tujuan} Jam: ${notif.jamawal.substring(0, 5)}`
        }));

        res.json({
            success: true,
            notifications: formattedNotifications
        });

    } catch (error) {
        console.error("Controller Error:", error);
        res.status(500).json({ success: false, message: 'Gagal memproses notifikasi' });
    }
}

async function checkActiveJobs(req, res) {
    const karKode = req.params.kar_kode;
    try {
        const result = await notificationsService.getActiveJobsForNotification(karKode);
        const jobCount = result.job_count || 0;

        if (jobCount > 0) {
            res.json({ 
                success: true, 
                show_notification: true,
                title: 'Pekerjaan Aktif',
                body: `Anda memiliki ${jobCount} pekerjaan yang perlu di-check in.`
            });
        } else {
            res.json({ success: true, show_notification: false });
        }
    } catch (error) {
        console.error("Notification Controller Error:", error);
        res.status(500).json({ success: false, message: 'Gagal memeriksa notifikasi.' });
    }
}

module.exports = {
    getNotifications,
    checkActiveJobs
};
