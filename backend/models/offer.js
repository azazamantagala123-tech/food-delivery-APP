// models/Offer.js
const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    discountType: {
        type: String,
        enum: ["percentage", "fixed"],
        required: true
    },
    discountValue: {
        type: Number,
        required: true
    },
    minOrderAmount: {
        type: Number,
        default: 0
    },
    maxDiscount: Number,
    validFrom: {
        type: Date,
        required: true
    },
    validUntil: {
        type: Date,
        required: true
    },
    applicableOn: {
        type: String,
        enum: ["all", "food", "category"],
        default: "all"
    },
    applicableItems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Food"
    }],
    usageLimit: Number,
    usedCount: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model("Offer", offerSchema);