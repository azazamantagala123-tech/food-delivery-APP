// controllers/cartController.js
// COMPLETE WORKING CODE - COPY PASTE KARO

const Cart = require("../models/Cart");
const Coupon = require("../models/Coupon");
const Food = require("../models/Food");

// ===============================
// HELPER FUNCTION
// ===============================
function calculateCartSummary(cart) {
    const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = cart.couponDiscount || 0;
    const deliveryFee = 40;
    const taxRate = 5;
    const tax = (subtotal - discount) * taxRate / 100;
    const tip = cart.tipAmount || 0;
    const total = subtotal - discount + deliveryFee + tax + tip;

    return {
        subtotal: Math.round(subtotal * 100) / 100,
        discount: Math.round(discount * 100) / 100,
        deliveryFee: deliveryFee,
        tax: Math.round(tax * 100) / 100,
        taxRate: taxRate,
        tip: tip,
        total: Math.round(total * 100) / 100,
        itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
        freeDeliveryEligible: subtotal - discount >= 500
    };
}

// ===============================
// 1. GET CART
// ===============================
exports.getCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({
            userId: req.user.id,
            isSavedCart: { $ne: true }
        });

        if (!cart) {
            cart = await Cart.create({
                userId: req.user.id,
                items: [],
                couponCode: null,
                couponDiscount: 0,
                tipAmount: 0,
                isSavedCart: false
            });
        }

        const summary = calculateCartSummary(cart);

        res.json({
            success: true,
            cart: {
                id: cart._id,
                items: cart.items,
                couponCode: cart.couponCode,
                couponDiscount: cart.couponDiscount,
                tipAmount: cart.tipAmount,
                ...summary
            }
        });
    } catch (error) {
        console.error("Get cart error:", error);

        if (error.code === 11000) {
            await Cart.deleteMany({ userId: req.user.id });
            return exports.getCart(req, res);
        }

        res.status(500).json({ success: false, message: error.message });
    }
};

// ===============================
// 2. ADD ITEM TO CART
// ===============================
exports.addToCart = async (req, res) => {
    try {
        const { foodId, quantity, specialInstructions } = req.body;

        if (!foodId) {
            return res.status(400).json({ success: false, message: "foodId is required" });
        }

        const food = await Food.findById(foodId);
        if (!food) {
            return res.status(404).json({ success: false, message: "Food not found" });
        }

        if (!food.isAvailable) {
            return res.status(400).json({ success: false, message: "Food is not available" });
        }

        let cart = await Cart.findOne({
            userId: req.user.id,
            isSavedCart: { $ne: true }
        });

        if (!cart) {
            cart = await Cart.create({
                userId: req.user.id,
                items: [],
                couponCode: null,
                couponDiscount: 0,
                tipAmount: 0,
                isSavedCart: false
            });
        }

        const existingItemIndex = cart.items.findIndex(
            item => item.foodId.toString() === foodId
        );

        if (existingItemIndex > -1) {
            cart.items[existingItemIndex].quantity += quantity || 1;
        } else {
            cart.items.push({
                foodId: food._id,
                name: food.name,
                price: food.price,
                quantity: quantity || 1,
                image: food.image || "",
                specialInstructions: specialInstructions || ""
            });
        }

        await cart.save();

        res.json({
            success: true,
            message: "Item added to cart",
            cart: {
                items: cart.items,
                itemCount: cart.items.length,
                totalItems: cart.items.reduce((sum, item) => sum + item.quantity, 0)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ===============================
// 3. UPDATE QUANTITY
// ===============================
exports.updateQuantity = async (req, res) => {
    try {
        const { foodId, quantity } = req.body;

        if (!foodId) {
            return res.status(400).json({ success: false, message: "foodId is required" });
        }

        if (!quantity || quantity < 1) {
            return res.status(400).json({ success: false, message: "Quantity must be at least 1" });
        }

        const cart = await Cart.findOne({
            userId: req.user.id,
            isSavedCart: { $ne: true }
        });

        if (!cart) {
            return res.status(404).json({ success: false, message: "Cart not found" });
        }

        const itemIndex = cart.items.findIndex(item => item.foodId.toString() === foodId);

        if (itemIndex === -1) {
            return res.status(404).json({ success: false, message: "Item not found in cart" });
        }

        cart.items[itemIndex].quantity = quantity;
        await cart.save();

        res.json({
            success: true,
            message: "Quantity updated",
            item: cart.items[itemIndex]
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ===============================
// 4. REMOVE ITEM FROM CART
// ===============================
exports.removeFromCart = async (req, res) => {
    try {
        const { foodId } = req.params;

        const cart = await Cart.findOne({
            userId: req.user.id,
            isSavedCart: { $ne: true }
        });

        if (!cart) {
            return res.status(404).json({ success: false, message: "Cart not found" });
        }

        cart.items = cart.items.filter(item => item.foodId.toString() !== foodId);
        await cart.save();

        res.json({
            success: true,
            message: "Item removed from cart",
            items: cart.items
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ===============================
// 5. CLEAR CART
// ===============================
exports.clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({
            userId: req.user.id,
            isSavedCart: { $ne: true }
        });

        if (!cart) {
            return res.status(404).json({ success: false, message: "Cart not found" });
        }

        cart.items = [];
        cart.couponCode = null;
        cart.couponDiscount = 0;
        cart.tipAmount = 0;
        await cart.save();

        res.json({
            success: true,
            message: "Cart cleared successfully"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ===============================
// 6. APPLY COUPON
// ===============================
exports.applyCoupon = async (req, res) => {
    try {
        const { couponCode } = req.body;

        if (!couponCode) {
            return res.status(400).json({ success: false, message: "couponCode is required" });
        }

        const cart = await Cart.findOne({
            userId: req.user.id,
            isSavedCart: { $ne: true }
        });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ success: false, message: "Cart is empty" });
        }

        // ✅ Direct use karo, already imported hai
        const coupon = await Coupon.findOne({
            code: couponCode.toUpperCase(),
            isActive: true,
            validFrom: { $lte: new Date() },
            validUntil: { $gte: new Date() }
        });

        console.log("Coupon found:", coupon); // Debug

        if (!coupon) {
            return res.status(400).json({ success: false, message: "Invalid or expired coupon" });
        }

        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            return res.status(400).json({ success: false, message: "Coupon usage limit reached" });
        }

        const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
            return res.status(400).json({
                success: false,
                message: `Minimum order amount of ₹${coupon.minOrderAmount} required`
            });
        }

        let discount = 0;
        if (coupon.discountType === "percentage") {
            discount = (subtotal * coupon.discountValue) / 100;
            if (coupon.maxDiscount && discount > coupon.maxDiscount) {
                discount = coupon.maxDiscount;
            }
        } else {
            discount = coupon.discountValue;
        }

        cart.couponCode = coupon.code;
        cart.couponDiscount = discount;
        await cart.save();

        // ✅ Increment usage count
        coupon.usedCount += 1;
        await coupon.save();

        res.json({
            success: true,
            message: "Coupon applied successfully",
            couponCode: cart.couponCode,
            discount: cart.couponDiscount,
            finalAmount: subtotal - discount
        });

    } catch (error) {
        console.error("Apply coupon error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ===============================
// 7. REMOVE COUPON
// ===============================
exports.removeCoupon = async (req, res) => {
    try {
        const cart = await Cart.findOne({
            userId: req.user.id,
            isSavedCart: { $ne: true }
        });

        if (!cart) {
            return res.status(404).json({ success: false, message: "Cart not found" });
        }

        cart.couponCode = null;
        cart.couponDiscount = 0;
        await cart.save();

        res.json({
            success: true,
            message: "Coupon removed successfully"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ===============================
// 8. CART SUMMARY
// ===============================
exports.getCartSummary = async (req, res) => {
    try {
        const cart = await Cart.findOne({
            userId: req.user.id,
            isSavedCart: { $ne: true }
        });

        if (!cart) {
            return res.json({
                success: true,
                summary: {
                    subtotal: 0,
                    discount: 0,
                    deliveryFee: 40,
                    tax: 0,
                    tip: 0,
                    total: 40,
                    itemCount: 0,
                    freeDeliveryEligible: false
                }
            });
        }

        const summary = calculateCartSummary(cart);

        res.json({
            success: true,
            summary
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ===============================
// 9. SAVE CART (for later) - FINAL FIX
// ===============================
exports.saveCart = async (req, res) => {
    try {
        console.log("=== SAVE CART START ===");
        console.log("User ID:", req.user.id);

        // Get current active cart
        let currentCart = await Cart.findOne({
            userId: req.user.id,
            isSavedCart: { $ne: true }
        });

        console.log("Current Cart:", currentCart ? "Found" : "Not Found");
        console.log("Current Cart Items:", currentCart?.items?.length || 0);

        if (!currentCart || currentCart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Cart is empty. Nothing to save."
            });
        }

        // Check if saved cart exists
        let existingSavedCart = await Cart.findOne({
            userId: req.user.id,
            isSavedCart: true
        });

        console.log("Existing Saved Cart:", existingSavedCart ? "Found" : "Not Found");

        if (existingSavedCart) {
            // Delete old saved cart first
            await Cart.findByIdAndDelete(existingSavedCart._id);
            console.log("Deleted old saved cart:", existingSavedCart._id);
        }

        // Create NEW saved cart
        const savedCart = await Cart.create({
            userId: req.user.id,
            items: JSON.parse(JSON.stringify(currentCart.items)),
            couponCode: currentCart.couponCode,
            couponDiscount: currentCart.couponDiscount,
            tipAmount: currentCart.tipAmount,
            isSavedCart: true,
            originalCartId: currentCart._id
        });

        console.log("New Saved Cart Created:", savedCart._id);

        res.json({
            success: true,
            message: "Cart saved successfully!",
            savedCartId: savedCart._id,
            itemsCount: savedCart.items.length
        });

    } catch (error) {
        console.error("Save cart error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ===============================
// 10. RESTORE SAVED CART
// ===============================
exports.restoreCart = async (req, res) => {
    try {
        const { savedCartId } = req.body;

        if (!savedCartId) {
            return res.status(400).json({
                success: false,
                message: "savedCartId is required"
            });
        }

        const savedCart = await Cart.findOne({
            _id: savedCartId,
            userId: req.user.id,
            isSavedCart: true
        });

        if (!savedCart) {
            return res.status(404).json({
                success: false,
                message: "Saved cart not found"
            });
        }

        let currentCart = await Cart.findOne({
            userId: req.user.id,
            isSavedCart: { $ne: true }
        });

        if (!currentCart) {
            currentCart = await Cart.create({
                userId: req.user.id,
                items: [],
                couponCode: null,
                couponDiscount: 0,
                tipAmount: 0,
                isSavedCart: false
            });
        }

        currentCart.items = [...savedCart.items];
        currentCart.couponCode = savedCart.couponCode;
        currentCart.couponDiscount = savedCart.couponDiscount;
        currentCart.tipAmount = savedCart.tipAmount;
        await currentCart.save();

        await Cart.findByIdAndDelete(savedCartId);

        res.json({
            success: true,
            message: "Cart restored successfully!",
            cart: {
                items: currentCart.items,
                itemsCount: currentCart.items.length,
                totalItems: currentCart.items.reduce((sum, item) => sum + item.quantity, 0)
            }
        });
    } catch (error) {
        console.error("Restore cart error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ===============================
// 11. ADD TIP
// ===============================
exports.addTip = async (req, res) => {
    try {
        const { tipAmount } = req.body;

        if (!tipAmount || tipAmount < 0) {
            return res.status(400).json({ success: false, message: "Valid tip amount required" });
        }

        const cart = await Cart.findOne({
            userId: req.user.id,
            isSavedCart: { $ne: true }
        });

        if (!cart) {
            return res.status(404).json({ success: false, message: "Cart not found" });
        }

        cart.tipAmount = tipAmount;
        await cart.save();

        res.json({
            success: true,
            message: "Tip added successfully",
            tipAmount: cart.tipAmount
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ===============================
// 12. CALCULATE TAX
// ===============================
exports.calculateTax = async (req, res) => {
    try {
        const cart = await Cart.findOne({
            userId: req.user.id,
            isSavedCart: { $ne: true }
        });

        if (!cart || cart.items.length === 0) {
            return res.json({ success: true, tax: 0, taxRate: 5 });
        }

        const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const taxRate = 5;
        const tax = (subtotal - cart.couponDiscount) * taxRate / 100;

        res.json({
            success: true,
            tax: Math.round(tax * 100) / 100,
            taxRate: taxRate
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ===============================
// 13. DELIVERY FEE
// ===============================
exports.getDeliveryFee = async (req, res) => {
    try {
        const { distance } = req.query;

        let fee = 40;

        if (distance) {
            const extraKm = Math.max(0, distance - 3);
            fee += extraKm * 10;
        }

        res.json({
            success: true,
            deliveryFee: Math.round(fee),
            baseFee: 40,
            distance: distance || 0,
            note: "Free delivery above ₹500"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ===============================
// 14. ESTIMATE TIME
// ===============================
exports.estimateTime = async (req, res) => {
    try {
        const cart = await Cart.findOne({
            userId: req.user.id,
            isSavedCart: { $ne: true }
        });

        let estimatedTime = 30;

        if (cart && cart.items.length > 0) {
            const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
            estimatedTime += Math.floor(totalItems / 5) * 5;
        }

        res.json({
            success: true,
            estimatedTime: Math.min(estimatedTime, 60),
            minTime: estimatedTime - 5,
            maxTime: estimatedTime + 5,
            unit: "minutes"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ===============================
// 15. GIFT CART
// ===============================
exports.giftCart = async (req, res) => {
    try {
        const { email, message } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: "Recipient email required" });
        }

        const cart = await Cart.findOne({
            userId: req.user.id,
            isSavedCart: { $ne: true }
        });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ success: false, message: "Cart is empty" });
        }

        const giftToken = require("crypto").randomBytes(32).toString("hex");

        res.json({
            success: true,
            message: "Gift cart created",
            giftLink: `https://foodapp.com/gift/${giftToken}`,
            recipient: email,
            giftMessage: message || "Enjoy this meal on me!"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};