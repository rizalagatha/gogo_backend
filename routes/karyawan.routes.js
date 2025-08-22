// routes/karyawan.routes.js

const express = require('express');
const router = express.Router();
const karyawanController = require('../controllers/karyawan.controller');

// Rute untuk GET /api/karyawan
router.get('/', karyawanController.getAllKaryawan);

// Rute untuk GET /api/karyawan/:kar_kode/history?start_date=...&end_date=...
router.get('/:kar_kode/history', karyawanController.getHistoryJob);

// Rute untuk GET /api/karyawan/:kar_kode/open-jobs
router.get('/:kar_kode/open-jobs', karyawanController.getOpenJobs);

// Rute untuk GET /api/karyawan/drivers
router.get('/drivers', karyawanController.getDrivers);

module.exports = router;
