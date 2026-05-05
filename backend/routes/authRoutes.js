// routes/authRoutes.js
const express = require("express");
const router = express.Router();

const {
    register,
    login,
    deliveryLogin,
    deliveryRegister,
    adminLogin
} = require("../controllers/authController");

// User Auth
router.post("/user/register", register);
router.post("/user/login", login);

// Delivery Auth
router.post("/delivery/login", deliveryLogin);
router.post("/delivery/register", deliveryRegister);

// Admin Auth
router.post("/admin/login", adminLogin);

module.exports = router;