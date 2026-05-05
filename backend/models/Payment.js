// models/Payment.js
const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: "INR"
    },
    method: {
        type: String,
        enum: ["razorpay", "cod", "wallet", "card", "upi"],
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "success", "failed", "refunded", "partial_refunded"],
        default: "pending"
    },
    razorpayOrderId: {
        type: String,
        default: null
    },
    razorpayPaymentId: {
        type: String,
        default: null
    },
    razorpaySignature: {
        type: String,
        default: null
    },
    transactionId: {
        type: String,
        unique: true,
        sparse: true
    },
    refundId: {
        type: String,
        default: null
    },
    refundAmount: {
        type: Number,
        default: 0
    },
    refundReason: {
        type: String,
        default: ""
    },
    paymentDetails: {
        cardLast4: { type: String, default: "" },
        cardBrand: { type: String, default: "" },
        upiVpa: { type: String, default: "" },
        bankName: { type: String, default: "" }
    },
    paidAt: {
        type: Date,
        default: null
    },
    metadata: {
        type: Object,
        default: {}
    }
}, { timestamps: true });

// Indexes for faster queries
paymentSchema.index({ orderId: 1 });
paymentSchema.index({ userId: 1 });
paymentSchema.index({ status: 1 });

module.exports = mongoose.model("Payment", paymentSchema);