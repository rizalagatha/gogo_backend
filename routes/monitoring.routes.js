// routes/monitoring.routes.js

const express = require('express');
const router = express.Router();
const monitoringController = require('../controllers/monitoring.controller');

// Rute untuk GET /api/monitoring
router.get('/', monitoringController.getMonitoringData);

module.exports = router;
