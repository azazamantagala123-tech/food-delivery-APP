// routes/cartRoutes.js
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
// ✅ REMOVE roleMiddleware - COMMENT IT OUT
// const roleMiddleware = require("../middleware/roleMiddleware");

const {
    getCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
    getCartSummary,
    saveCart,
    restoreCart,
    addTip,
    calculateTax,
    getDeliveryFee,
    estimateTime,
    giftCart
} = require("../controllers/cartController");

// ✅ Only authMiddleware - any logged in user can access cart
router.use(authMiddleware);
// ✅ REMOVE this line - router.use(roleMiddleware("user"));

// Cart CRUD
router.get("/", getCart);
router.post("/add", addToCart);
router.put("/update", updateQuantity);
router.delete("/remove/:foodId", removeFromCart);
router.delete("/clear", clearCart);

// Coupon
router.post("/apply-coupon", applyCoupon);
router.delete("/remove-coupon", removeCoupon);

// Summary & Calculations
router.get("/summary", getCartSummary);
router.get("/tax", calculateTax);
router.get("/delivery-fee", getDeliveryFee);
router.get("/estimate-time", estimateTime);

// Additional Features
router.post("/tip", addTip);
router.post("/save", saveCart); 
router.post("/restore", restoreCart);
router.post("/gift", giftCart);

module.exports = router;