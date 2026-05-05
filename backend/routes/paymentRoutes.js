// routes/paymentRoutes.js
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
    initiatePayment,
    verifyPayment,
    getPaymentHistory,
    getPaymentMethods,
    walletPayment,
    codPayment,
    getPaymentStatus,
    requestRefund,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod,
    getInvoice,
    getTaxDetails,
    splitPayment,
    retryPayment
} = require("../controllers/paymentController");

// User Payment Routes
router.post("/initiate", authMiddleware, roleMiddleware("user"), initiatePayment);
router.post("/verify", authMiddleware, roleMiddleware("user"), verifyPayment);
router.get("/history", authMiddleware, roleMiddleware("user"), getPaymentHistory);
router.get("/methods", authMiddleware, roleMiddleware("user"), getPaymentMethods);
router.post("/wallet", authMiddleware, roleMiddleware("user"), walletPayment);
router.post("/cod", authMiddleware, roleMiddleware("user"), codPayment);
router.get("/status/:paymentId", authMiddleware, roleMiddleware("user"), getPaymentStatus);
router.post("/refund", authMiddleware, roleMiddleware("user"), requestRefund);
router.post("/add-method", authMiddleware, roleMiddleware("user"), addPaymentMethod);
router.delete("/remove-method/:methodId", authMiddleware, roleMiddleware("user"), removePaymentMethod);
router.post("/default-method", authMiddleware, roleMiddleware("user"), setDefaultPaymentMethod);
router.get("/invoice/:paymentId", authMiddleware, roleMiddleware("user"), getInvoice);
router.get("/tax", authMiddleware, roleMiddleware("user"), getTaxDetails);
router.post("/split", authMiddleware, roleMiddleware("user"), splitPayment);
router.post("/retry/:paymentId", authMiddleware, roleMiddleware("user"), retryPayment);

module.exports = router;