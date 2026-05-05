// models/Cart.js - FIXED (Remove unique: true)

const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
    foodId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Food",
        required: true
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1
    },
    image: {
        type: String,
        default: ""
    },
    specialInstructions: {
        type: String,
        default: ""
    }
});

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
        // ✅ REMOVED unique: true
    },
    items: [cartItemSchema],
    couponCode: {
        type: String,
        default: null
    },
    couponDiscount: {
        type: Number,
        default: 0
    },
    tipAmount: {
        type: Number,
        default: 0
    },
    isSavedCart: {
        type: Boolean,
        default: false
    },
    originalCartId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Cart"
    }
}, { timestamps: true });

// ✅ Add compound index for userId + isSavedCart
cartSchema.index({ userId: 1, isSavedCart: 1 }, { unique: true });

module.exports = mongoose.model("Cart", cartSchema);