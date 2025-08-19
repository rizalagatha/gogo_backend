// routes/kendaraan.routes.js

const express = require('express');
const router = express.Router();
const kendaraanController = require('../controllers/kendaraan.controller');

// Rute untuk GET /api/kendaraan/checkin-data
router.get('/checkin-data', kendaraanController.getCheckinData);
router.get('/:noplat/history', kendaraanController.getHistoryPerawatan);
router.get('/', kendaraanController.getAllKendaraan);
router.get('/search', kendaraanController.searchKendaraan);

module.exports = router;
