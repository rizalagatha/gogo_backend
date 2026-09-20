// routes/auth.routes.js

const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

// Rute untuk POST /api/auth/login
router.post("/login", authController.login);
router.get("/credentials", authController.getCredentials);
router.post("/change-password", authController.changePassword);

module.exports = router;
