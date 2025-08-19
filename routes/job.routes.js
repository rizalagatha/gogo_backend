// routes/job.routes.js

const express = require('express');
const router = express.Router();
const jobController = require('../controllers/job.controller');

router.get('/', jobController.getAllActiveJobs);
router.get('/batal', jobController.getAllBatalJobs);
router.get('/checkout-list', jobController.getCheckoutList);
router.get('/:nomor_job/detail', jobController.getJobDetail);

module.exports = router;
