// File: routes/visit.routes.js

const express = require('express');
const router = express.Router();
const visitController = require('../controllers/visit.controller');

// Definisikan rute untuk GET /api/visit/:id
// Rute ini akan ditangani oleh fungsi getVisitDetail dari controller.
router.get('/:id', visitController.getVisitDetail);

module.exports = router;
