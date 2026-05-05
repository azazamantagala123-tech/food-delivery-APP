// routes/adminRoutes.js
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Delivery Management
const {
    createDelivery,
    getAllDeliveryBoys,
    getDeliveryBoyById,
    updateDeliveryBoy,
    deleteDeliveryBoy,
    approveKYC,
    rejectKYC,
    getPendingKYC,
    getAllKYCRequests,
    getAdminStats,
    createCoupon,
    getAllCoupons,
    getCouponById,
    updateCoupon,
    deleteCoupon,
    toggleCouponStatus,
    getAdmin,
    deleteAdmin,
    createAdmin,
    getAllUsers,
    getUserById,
    blockUser,
    getDeliveryBoyDetails,
    updateOrderStatus,
    getLiveOrders,
    createOffer,
    getAllOffers,
    deleteOffer,
    createCategory,
    getAllCategories,
    updateCategory,
    deleteCategory,
    getAnalytics,
    getRevenueReports,
    getCustomReports,
    getFraudLogs,
    getAllReviews,
    deleteReview,
    getAllComplaints,
    approveRefund,
    rejectRefund,
    getSystemLogs,
    sendNotification,
    sendPushNotification,
    getSystemHealth,
    toggleFeature,
    getSettings,
    updateSettings
} = require("../controllers/adminController");

const { assignDeliveryBoy, getAllOrders, getOrderStats } = require("../controllers/adminOrderController");
const { addFood, updateFood, deleteFood, getAllFoods, getFoodById } = require("../controllers/foodController");

// ==================== ADMIN MANAGEMENT ====================
router.post("/create-admin", createAdmin);
router.delete("/delete-admin", authMiddleware, roleMiddleware("admin"), deleteAdmin);
router.get("/get-admin", getAdmin);

// ==================== DASHBOARD ====================
router.get("/dashboard", authMiddleware, roleMiddleware("admin"), (req, res) => {
    res.json({ message: "Welcome Admin Dashboard", user: req.user });
});
router.get("/stats", authMiddleware, roleMiddleware("admin"), getAdminStats);

// ==================== DELIVERY BOY MANAGEMENT ====================
router.post("/create-delivery", authMiddleware, roleMiddleware("admin"), createDelivery);
router.get("/deliveries", authMiddleware, roleMiddleware("admin"), getAllDeliveryBoys);
router.get("/delivery/:id", authMiddleware, roleMiddleware("admin"), getDeliveryBoyById);
router.put("/update-delivery/:id", authMiddleware, roleMiddleware("admin"), updateDeliveryBoy);
router.delete("/delete-delivery/:id", authMiddleware, roleMiddleware("admin"), deleteDeliveryBoy);

// ==================== KYC MANAGEMENT ====================
router.post("/kyc/approve", authMiddleware, roleMiddleware("admin"), approveKYC);
router.post("/kyc/reject", authMiddleware, roleMiddleware("admin"), rejectKYC);
router.get("/kyc/pending", authMiddleware, roleMiddleware("admin"), getPendingKYC);
router.get("/kyc/all", authMiddleware, roleMiddleware("admin"), getAllKYCRequests);

// ==================== ORDER MANAGEMENT ====================
router.post("/assign-order", authMiddleware, roleMiddleware("admin"), assignDeliveryBoy);
router.get("/orders", authMiddleware, roleMiddleware("admin"), getAllOrders);
router.get("/orders/stats", authMiddleware, roleMiddleware("admin"), getOrderStats);
router.put("/order-status", authMiddleware, roleMiddleware("admin"), updateOrderStatus);
router.get("/live-orders", authMiddleware, roleMiddleware("admin"), getLiveOrders);

// ==================== FOOD MANAGEMENT ====================
router.post("/food", authMiddleware, roleMiddleware("admin"), addFood);
router.put("/food/:id", authMiddleware, roleMiddleware("admin"), updateFood);
router.delete("/food/:id", authMiddleware, roleMiddleware("admin"), deleteFood);
router.get("/foods", authMiddleware, roleMiddleware("admin"), getAllFoods);
router.get("/food/:id", authMiddleware, roleMiddleware("admin"), getFoodById);

// ==================== COUPON MANAGEMENT ====================
router.post("/coupon", authMiddleware, roleMiddleware("admin"), createCoupon);
router.get("/coupons", authMiddleware, roleMiddleware("admin"), getAllCoupons);
router.get("/coupon/:id", authMiddleware, roleMiddleware("admin"), getCouponById);
router.put("/coupon/:id", authMiddleware, roleMiddleware("admin"), updateCoupon);
router.delete("/coupon/:id", authMiddleware, roleMiddleware("admin"), deleteCoupon);
router.patch("/coupon/:id/toggle", authMiddleware, roleMiddleware("admin"), toggleCouponStatus);

// ==================== USER MANAGEMENT ====================
router.get("/users", authMiddleware, roleMiddleware("admin"), getAllUsers);
router.get("/user/:id", authMiddleware, roleMiddleware("admin"), getUserById);
router.delete("/user/:id", authMiddleware, roleMiddleware("admin"), blockUser);
router.get("/delivery-details/:id", authMiddleware, roleMiddleware("admin"), getDeliveryBoyDetails);

// ==================== OFFER MANAGEMENT ====================
router.post("/offer", authMiddleware, roleMiddleware("admin"), createOffer);
router.get("/offers", authMiddleware, roleMiddleware("admin"), getAllOffers);
router.delete("/offer/:id", authMiddleware, roleMiddleware("admin"), deleteOffer);

// ==================== CATEGORY MANAGEMENT ====================
router.post("/category", authMiddleware, roleMiddleware("admin"), createCategory);
router.get("/categories", authMiddleware, roleMiddleware("admin"), getAllCategories);
router.put("/category/:id", authMiddleware, roleMiddleware("admin"), updateCategory);
router.delete("/category/:id", authMiddleware, roleMiddleware("admin"), deleteCategory);

// ==================== ANALYTICS & REPORTS ====================
router.get("/analytics", authMiddleware, roleMiddleware("admin"), getAnalytics);
router.get("/revenue", authMiddleware, roleMiddleware("admin"), getRevenueReports);
router.post("/reports", authMiddleware, roleMiddleware("admin"), getCustomReports);
router.get("/fraud", authMiddleware, roleMiddleware("admin"), getFraudLogs);

// ==================== REVIEWS & COMPLAINTS ====================
router.get("/reviews", authMiddleware, roleMiddleware("admin"), getAllReviews);
router.delete("/review/:id", authMiddleware, roleMiddleware("admin"), deleteReview);
router.get("/complaints", authMiddleware, roleMiddleware("admin"), getAllComplaints);

// ==================== FINANCIAL MANAGEMENT ====================
router.post("/refund-approve", authMiddleware, roleMiddleware("admin"), approveRefund);
router.post("/refund-reject", authMiddleware, roleMiddleware("admin"), rejectRefund);

// ==================== SYSTEM & NOTIFICATIONS ====================
router.get("/logs", authMiddleware, roleMiddleware("admin"), getSystemLogs);
router.post("/notification", authMiddleware, roleMiddleware("admin"), sendNotification);
router.post("/push-notification", authMiddleware, roleMiddleware("admin"), sendPushNotification);
router.get("/system-health", authMiddleware, roleMiddleware("admin"), getSystemHealth);
router.post("/feature-toggle", authMiddleware, roleMiddleware("admin"), toggleFeature);
router.get("/settings", authMiddleware, roleMiddleware("admin"), getSettings);
router.post("/settings", authMiddleware, roleMiddleware("admin"), updateSettings);

module.exports = router;