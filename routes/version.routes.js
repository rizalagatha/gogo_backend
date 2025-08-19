// routes/version.routes.js

const express = require('express');
const router = express.Router();
const versionController = require('../controllers/version.controller');

// Rute untuk GET /api/app-version
router.get('/', versionController.getVersion);

module.exports = router;
