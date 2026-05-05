// routes/deliveryRoutes.js
// COMPLETE WORKING CODE - COPY PASTE KARO

const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const upload = require("../middleware/upload.middleware");

// Navigation Controllers
const { 
    startNavigation, 
    getRoute, 
    updateLocationAndRoute, 
    getOptimizedRoute,
    getLiveTracking              // Live tracking for users
} = require("../controllers/navigationController");

// Delivery Controllers
const { 
    getAllDeliveries, 
    updateDelivery, 
    deleteDelivery, 
    uploadDocs, 
    getKycStatus, 
    getAssignedOrders,
    getOrderDetail, 
    updateOrderStatus, 
    acceptDelivery, 
    rejectDelivery, 
    updateLocation, 
    getWallet,
    withdrawEarnings, 
    getRatings, 
    raiseSupport,
    getDeliveryHistory,          // Delivery history
    getEarnings,                 // Earnings analytics
    getAvailability,             // Check availability
    goOnline,                    // Go online
    goOffline,                   // Go offline
    getShift,                    // Get shift timing
    setBreak,                    // Start/End break
    getAgentDetails,             // Get agent details
    cashCollect,                 // Collect cash from COD
    confirmPickup,               // Confirm pickup
    confirmDrop                  // Confirm drop
} = require("../controllers/deliveryController");

// ===============================
// ADMIN ROUTES
// ===============================
// Get all delivery boys
router.get("/all", authMiddleware, roleMiddleware("admin"), getAllDeliveries);

// Update delivery boy
router.put("/update/:id", authMiddleware, roleMiddleware("admin"), updateDelivery);

// Delete delivery boy
router.delete("/delete/:id", authMiddleware, roleMiddleware("admin"), deleteDelivery);

// Get agent details (admin can view any agent)
router.get("/agent/:id", authMiddleware, roleMiddleware("admin"), getAgentDetails);

// ===============================
// KYC & DOCUMENT ROUTES
// ===============================
// Upload KYC documents
router.post("/upload-docs", authMiddleware, roleMiddleware("delivery"), upload.fields([
    { name: "aadhaar", maxCount: 1 }, 
    { name: "panCard", maxCount: 1 },
    { name: "license", maxCount: 1 }, 
    { name: "profilePhoto", maxCount: 1 }
]), uploadDocs);

// Get KYC status
router.get("/status", authMiddleware, roleMiddleware("delivery"), getKycStatus);

// ===============================
// ORDER MANAGEMENT ROUTES
// ===============================
// Get assigned orders
router.get("/orders", authMiddleware, roleMiddleware("delivery"), getAssignedOrders);

// Get order detail
router.get("/order/:id", authMiddleware, roleMiddleware("delivery"), getOrderDetail);

// Update order status
router.post("/update-status", authMiddleware, roleMiddleware("delivery"), updateOrderStatus);

// Accept delivery
router.post("/accept", authMiddleware, roleMiddleware("delivery"), acceptDelivery);

// Reject delivery
router.post("/reject", authMiddleware, roleMiddleware("delivery"), rejectDelivery);

// Get delivery history
router.get("/history", authMiddleware, roleMiddleware("delivery"), getDeliveryHistory);

// ===============================
// PICKUP & DROP ROUTES
// ===============================
// Confirm pickup
router.post("/pickup", authMiddleware, roleMiddleware("delivery"), confirmPickup);

// Confirm drop
router.post("/drop", authMiddleware, roleMiddleware("delivery"), confirmDrop);

// Cash collection (COD)
router.post("/cash-collect", authMiddleware, roleMiddleware("delivery"), cashCollect);

// ===============================
// LOCATION & TRACKING ROUTES
// ===============================
// Update location
router.post("/location", authMiddleware, roleMiddleware("delivery"), updateLocation);

// Start navigation
router.post("/navigation", authMiddleware, roleMiddleware("delivery"), startNavigation);

// Get route
router.get("/route/:orderId", authMiddleware, roleMiddleware("delivery"), getRoute);

// Update navigation location
router.post("/navigation/update", authMiddleware, roleMiddleware("delivery"), updateLocationAndRoute);

// Optimized route for multiple orders
router.post("/route/optimized", authMiddleware, roleMiddleware("delivery"), getOptimizedRoute);

// Live tracking (for user/admin/delivery)
router.get("/tracking/:orderId", authMiddleware, getLiveTracking);

// ===============================
// WALLET & EARNINGS ROUTES
// ===============================
// Get wallet balance
router.get("/wallet", authMiddleware, roleMiddleware("delivery"), getWallet);

// Withdraw earnings
router.post("/withdraw", authMiddleware, roleMiddleware("delivery"), withdrawEarnings);

// Get earnings analytics
router.get("/earnings", authMiddleware, roleMiddleware("delivery"), getEarnings);

// ===============================
// SHIFT & AVAILABILITY ROUTES
// ===============================
// Get shift timing
router.get("/shift", authMiddleware, roleMiddleware("delivery"), getShift);

// Set break (start/end)
router.post("/break", authMiddleware, roleMiddleware("delivery"), setBreak);

// Go online
router.post("/online", authMiddleware, roleMiddleware("delivery"), goOnline);

// Go offline
router.post("/offline", authMiddleware, roleMiddleware("delivery"), goOffline);

// Get availability status
router.get("/availability", authMiddleware, roleMiddleware("delivery"), getAvailability);

// ===============================
// RATINGS & SUPPORT ROUTES
// ===============================
// Get ratings & reviews
router.get("/ratings", authMiddleware, roleMiddleware("delivery"), getRatings);

// Raise support ticket
router.post("/support", authMiddleware, roleMiddleware("delivery"), raiseSupport);

// ===============================
// AGENT DETAILS ROUTE
// ===============================
// Get own agent details
router.get("/me", authMiddleware, roleMiddleware("delivery"), getAgentDetails);

module.exports = router;