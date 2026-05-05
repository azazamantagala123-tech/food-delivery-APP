const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
    getProfile,
    updateProfile,
    uploadAvatar,
    getAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    getWallet,
    addMoney,
    getWalletHistory,
    getNotifications,
    markNotificationRead,
    getPreferences,
    updatePreferences,
    getUserOrders,
    getRewards,
    applyReferral,
    getSubscription,
    upgradeSubscription,
    deleteAccount,
    getUserActivity,
    submitFeedback,
    getFavorites,
    addFavorite,
    removeFavorite,
    getMembership,
    getLoginHistory,
    getSecuritySettings,
    changePassword,
    createSupportTicket,
    trackSupport,
    reportIssue,
    getPaymentMethods,
    addPaymentMethod,
    removePaymentMethod,
    getLoyaltyTier,
    updateNotificationSettings
} = require("../controllers/userController");

// ==================== DASHBOARD ====================
router.get("/dashboard", authMiddleware, (req, res) => {
    res.json({ message: "Welcome User Dashboard", user: req.user });
});

// ==================== PROFILE MANAGEMENT ====================
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.post("/avatar", authMiddleware, uploadAvatar);

// ==================== ADDRESS MANAGEMENT ====================
router.get("/address", authMiddleware, getAddresses);
router.post("/address", authMiddleware, addAddress);
router.put("/address/:id", authMiddleware, updateAddress);
router.delete("/address/:id", authMiddleware, deleteAddress);

// ==================== WALLET MANAGEMENT ====================
router.get("/wallet", authMiddleware, getWallet);
router.post("/wallet/add", authMiddleware, addMoney);
router.get("/wallet/history", authMiddleware, getWalletHistory);

// ==================== NOTIFICATIONS ====================
router.get("/notifications", authMiddleware, getNotifications);
router.post("/notifications/read", authMiddleware, markNotificationRead);

// ==================== PREFERENCES ====================
router.get("/preferences", authMiddleware, getPreferences);
router.put("/preferences", authMiddleware, updatePreferences);

// ==================== ORDERS ====================
router.get("/orders", authMiddleware, getUserOrders);

// ==================== REWARDS & REFERRAL ====================
router.get("/rewards", authMiddleware, getRewards);
router.post("/referral", authMiddleware, applyReferral);

// ==================== SUBSCRIPTION ====================
router.get("/subscription", authMiddleware, getSubscription);
router.post("/subscription/upgrade", authMiddleware, upgradeSubscription);

// ==================== ACCOUNT ====================
router.delete("/account", authMiddleware, deleteAccount);
router.get("/activity", authMiddleware, getUserActivity);

// ==================== FEEDBACK ====================
router.post("/feedback", authMiddleware, submitFeedback);

// ==================== FAVORITES ====================
router.get("/favorites", authMiddleware, getFavorites);
router.post("/favorites/add", authMiddleware, addFavorite);
router.delete("/favorites/remove", authMiddleware, removeFavorite);

// ==================== MEMBERSHIP ====================
router.get("/membership", authMiddleware, getMembership);

// ==================== SECURITY ====================
router.post("/login-history", authMiddleware, getLoginHistory);
router.get("/security-settings", authMiddleware, getSecuritySettings);
router.post("/change-password", authMiddleware, changePassword);

// ==================== SUPPORT ====================
router.post("/support", authMiddleware, createSupportTicket);
router.get("/support/:id", authMiddleware, trackSupport);
router.post("/report-issue", authMiddleware, reportIssue);

// ==================== PAYMENT METHODS ====================
router.get("/payment-methods", authMiddleware, getPaymentMethods);
router.post("/add-payment-method", authMiddleware, addPaymentMethod);
router.delete("/remove-payment-method", authMiddleware, removePaymentMethod);

// ==================== LOYALTY ====================
router.get("/loyalty-tier", authMiddleware, getLoyaltyTier);

// ==================== NOTIFICATION SETTINGS ====================
router.post("/notification-settings", authMiddleware, updateNotificationSettings);

module.exports = router;