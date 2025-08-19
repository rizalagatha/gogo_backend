// routes/permintaan.routes.js

const express = require('express');
const router = express.Router();
const permintaanController = require('../controllers/permintaan.controller');

// Rute untuk GET /api/permintaan/form-data
router.get('/form-data', permintaanController.getFormData);
router.get('/selectable-jobs', permintaanController.getSelectableJobs);
// Rute untuk POST /api/permintaan/
router.post('/', permintaanController.submitPermintaan);

module.exports = router;
