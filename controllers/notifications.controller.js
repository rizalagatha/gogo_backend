// controllers/notifications.controller.js

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

module.exports = {
    getNotifications
};
