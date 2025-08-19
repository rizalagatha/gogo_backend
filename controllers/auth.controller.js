// controllers/auth.controller.js

const { get } = require('../routes/version.routes');
const authService = require('../services/auth.service');

async function login(req, res) {
    // Ambil username dan password dari body permintaan
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username dan password tidak boleh kosong.' });
    }

    try {
        const userData = await authService.login(username, password);

        if (userData) {
            res.json({
                success: true,
                message: 'Login berhasil',
                user: userData
            });
        } else {
            res.status(401).json({ success: false, message: 'Login atau password salah' });
        }
    } catch (error) {
        console.error("Controller Error:", error);
        res.status(500).json({ success: false, message: 'Gagal memproses login' });
    }
}

async function getCredentials(req, res) {
    const { kode } = req.query;

    if (!kode) {
        return res.status(400).json({ success: false, message: 'Kode tidak boleh kosong.' });
    }

    try {
        const result = await authService.getPasswordByKode(kode);
        if (result) {
            res.json({ success: true, password: result.kar_password });
        } else {
            res.status(404).json({ success: false, message: 'User tidak ditemukan' });
        }
    } catch (error) {
        console.error("Controller Error:", error);
        res.status(500).json({ success: false, message: 'Gagal mengambil kredensial' });
    }
}

module.exports = {
    login,
    getCredentials
};
