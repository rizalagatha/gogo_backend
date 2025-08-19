// routes/perawatan.routes.js

const express = require('express');
const router = express.Router();
const perawatanController = require('../controllers/perawatan.controller');

// Rute untuk GET /api/perawatan/form-data
router.get('/form-data', perawatanController.getFormData);

// Rute untuk POST /api/perawatan/
router.post('/', perawatanController.submitPerawatan);

module.exports = router;
