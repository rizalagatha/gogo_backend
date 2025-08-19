// routes/notifications.routes.js

const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notifications.controller');

// Rute untuk GET /api/notifications?user_kode=...
router.get('/', notificationsController.getNotifications);

module.exports = router;
