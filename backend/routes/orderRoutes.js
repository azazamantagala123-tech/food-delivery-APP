// routes/orderRoutes.js
// ✅ SPECIFIC ROUTES PEHLE, DYNAMIC ROUTES BAAD MEIN

const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
    createOrder,
    getOrderById,
    getUserOrders,
    cancelOrder,
    reorder,
    rateOrder,
    getOrderStatus,
    scheduleOrder,
    getOrderHistory,
    splitOrder,
    mergeOrders,
    generateInvoice,
    getInvoice,
    orderSupport,
    getSupportStatus,
    reportIssue,
    requestRefund,
    getRefundStatus,
    priorityOrder,
    getEstimatedTime,
    addInstructions,
    getOrderTimeline,
    rescheduleOrder,
    getLiveStatus,
    confirmDelivery
} = require("../controllers/orderController");

// ==================== SPECIFIC ROUTES (PEHLE) ====================
router.get("/live-status", authMiddleware, getLiveStatus);  // ✅ PEHLE
router.get("/my-orders", authMiddleware, roleMiddleware("user"), getUserOrders);
router.get("/history", authMiddleware, roleMiddleware("user"), getOrderHistory);
router.get("/status/:id", authMiddleware, getOrderStatus);
router.get("/invoice/:id", authMiddleware, getInvoice);
router.get("/support/:id", authMiddleware, getSupportStatus);
router.get("/refund/:id", authMiddleware, getRefundStatus);
router.get("/eta/:id", authMiddleware, getEstimatedTime);
router.get("/timeline/:id", authMiddleware, getOrderTimeline);

// ==================== POST ROUTES ====================
router.post("/create", authMiddleware, roleMiddleware("user"), createOrder);
router.post("/cancel", authMiddleware, roleMiddleware("user"), cancelOrder);
router.post("/reorder", authMiddleware, roleMiddleware("user"), reorder);
router.post("/rate", authMiddleware, roleMiddleware("user"), rateOrder);
router.post("/schedule", authMiddleware, roleMiddleware("user"), scheduleOrder);
router.post("/split", authMiddleware, roleMiddleware("user"), splitOrder);
router.post("/merge", authMiddleware, roleMiddleware("user"), mergeOrders);
router.post("/invoice", authMiddleware, roleMiddleware("user"), generateInvoice);
router.post("/support", authMiddleware, roleMiddleware("user"), orderSupport);
router.post("/issue", authMiddleware, roleMiddleware("user"), reportIssue);
router.post("/refund", authMiddleware, roleMiddleware("user"), requestRefund);
router.post("/priority", authMiddleware, roleMiddleware("user"), priorityOrder);
router.post("/instructions", authMiddleware, roleMiddleware("user"), addInstructions);
router.post("/reschedule", authMiddleware, roleMiddleware("user"), rescheduleOrder);
router.post("/confirm-delivery", authMiddleware, roleMiddleware("user"), confirmDelivery);

// ==================== DYNAMIC ROUTES (LAST MEIN) ====================
router.get("/:id", authMiddleware, getOrderById);  // ✅ LAST MEIN

module.exports = router;