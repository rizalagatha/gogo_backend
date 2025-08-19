// controllers/kegiatan.controller.js

const { get } = require('../routes/version.routes');
const kegiatanService = require('../services/kegiatan.service');

async function getOpenJobStatus(req, res) {
    // Ambil user_kode dari query parameter di URL
    const userKode = req.query.user_kode;

    if (!userKode) {
        return res.status(400).json({ success: false, message: 'user_kode tidak boleh kosong.' });
    }

    try {
        const result = await kegiatanService.checkOpenJob(userKode);

        res.json({
            success: true,
            has_open_job: !!result, // Konversi hasil menjadi boolean (true jika ada, false jika null)
            kegiatan_id: result ? result.id : null
        });

    } catch (error) {
        console.error("Controller Error:", error);
        res.status(500).json({ success: false, message: 'Gagal memeriksa status pekerjaan' });
    }
}

async function getCheckoutForm(req, res) {
    const { kar_kode, nomor_minta } = req.query;

    if (!kar_kode || !nomor_minta) {
        return res.status(400).json({ success: false, message: 'Parameter tidak lengkap.' });
    }

    try {
        const kegiatan = await kegiatanService.getCheckoutFormData(kar_kode, nomor_minta);
        const standby_locations = ['Padokan', 'Jeron', 'Kalioso'];

        if (kegiatan) {
            let status_text = 'Terjadwal';
            if (kegiatan.isplan == 1) {
                status_text = 'Tidak Terjadwal';
            } else if (kegiatan.isplan == 2) {
                status_text = 'Keterlaluan';
            }
            kegiatan.status_text = status_text;

            res.json({
                success: true,
                data: kegiatan,
                standby_options: standby_locations
            });
        } else {
            res.status(404).json({ success: false, message: 'Kegiatan aktif tidak ditemukan.' });
        }
    } catch (error) {
        console.error("Controller Error:", error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data form checkout' });
    }
}

async function getKegiatanDetail(req, res) {
    const kegiatanId = req.params.id;

    if (!kegiatanId) {
        return res.status(400).json({ success: false, message: 'ID Kegiatan tidak boleh kosong.' });
    }

    try {
        const result = await kegiatanService.getKegiatanDetail(kegiatanId);

        if (result && result.main_data) {
            res.json({
                success: true,
                main_data: result.main_data,
                sub_details: result.sub_details
            });
        } else {
            res.status(404).json({ success: false, message: 'Data kegiatan tidak ditemukan.' });
        }
    } catch (error) {
        console.error("Controller Error:", error);
        res.status(500).json({ success: false, message: 'Gagal mengambil detail kegiatan' });
    }
}


async function getKegiatanInfo(req, res) {
    const kegiatanId = req.params.id;

    if (!kegiatanId) {
        return res.status(400).json({ success: false, message: 'ID Kegiatan tidak boleh kosong.' });
    }

    try {
        const kegiatan = await kegiatanService.getKegiatanInfo(kegiatanId);
        if (kegiatan) {
            res.json({ success: true, data: kegiatan });
        } else {
            res.status(404).json({ success: false, message: 'Kegiatan aktif tidak ditemukan.' });
        }
    } catch (error) {
        console.error("Controller Error:", error);
        res.status(500).json({ success: false, message: 'Gagal mengambil info kegiatan' });
    }
}

async function submitCheckin(req, res) {
    try {
        const result = await kegiatanService.submitCheckin(req.body);
        res.json({ success: true, message: 'Check In berhasil disimpan.' });
    } catch (error) {
        console.error("Controller Error:", error);
        res.status(500).json({ success: false, message: 'Gagal menyimpan data check-in' });
    }
}

async function submitCheckout(req, res) {
    try {
        const data = {
            ...req.body,                     // ambil semua field dari body
            foto: req.file ? req.file.filename : null  // ambil nama file dari Multer
        };

        const result = await kegiatanService.submitCheckout(data); // panggil service
        res.json({ success: true, message: 'Check Out berhasil.' });
    } catch (error) {
        console.error("Controller Error:", error);
        res.status(500).json({ success: false, message: 'Gagal menyimpan data check-out' });
    }
}

async function submitKegiatanDetail(req, res) {
    try {
        const detailData = {
            // Menggunakan 'kegiatan_id' agar cocok dengan yang dikirim Flutter
            header_id: req.body.kegiatan_id, 
            customer: req.body.customer,
            latitude: req.body.latitude,
            longitude: req.body.longitude,
            // Menyimpan nama file yang di-generate oleh multer
            foto_path: req.file ? req.file.filename : null, 
        };

        console.log("DEBUG detailData:", detailData);       

        const result = await kegiatanService.submitKegiatanDetail(detailData);
        res.json({ success: true, message: 'Update info berhasil disimpan.' });
    } catch (error) {
        console.error("Controller Error:", error);
        res.status(500).json({ success: false, message: 'Gagal menyimpan detail kegiatan' });
    }
}

async function getAllDetailsForKegiatan(req, res) {
    const kegiatanId = parseInt(req.params.id, 10);

    if (isNaN(kegiatanId)) {
        return res.status(400).json({ success: false, message: 'ID Kegiatan tidak valid.' });
    }

    try {
        const details = await kegiatanService.getDetailsByKegiatanId(kegiatanId);
        res.json({ success: true, data: details });
    } catch (error) {
        console.error("Controller Error:", error);
        res.status(500).json({ success: false, message: 'Gagal mengambil detail kegiatan.' });
    }
}

module.exports = {
    getOpenJobStatus,
    getCheckoutForm,
    getKegiatanDetail,
    getKegiatanInfo,
    submitCheckin,
    submitCheckout,
    submitKegiatanDetail,
    getAllDetailsForKegiatan
};
