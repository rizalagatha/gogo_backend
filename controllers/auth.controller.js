// controllers/auth.controller.js

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

module.exports = {
    login
};
