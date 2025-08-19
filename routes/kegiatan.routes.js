// routes/kegiatan.routes.js

const express = require('express');
const router = express.Router();
const kegiatanController = require('../controllers/kegiatan.controller');
const upload = require('../middleware/upload');

// Rute untuk GET /api/kegiatan/check-open?user_kode=...
router.get('/check-open', kegiatanController.getOpenJobStatus);
router.get('/checkout-form', kegiatanController.getCheckoutForm);
router.get('/:id/detail', kegiatanController.getKegiatanDetail);
router.get('/:id/info', kegiatanController.getKegiatanInfo);
router.post('/checkin', kegiatanController.submitCheckin);
router.post('/checkout', upload.single('foto'), kegiatanController.submitCheckout);
router.post('/detail', upload.single('foto'), kegiatanController.submitKegiatanDetail);
router.get('/:id/details', kegiatanController.getAllDetailsForKegiatan);

module.exports = router;
