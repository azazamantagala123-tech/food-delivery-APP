// models/Refund.js
const mongoose = require("mongoose");

const refundSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected", "completed"],
        default: "pending"
    },
    paymentMethod: {
        type: String,
        enum: ["wallet", "bank", "upi"],
        default: "wallet"
    },
    transactionId: String,
    remarks: String,
    processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    processedAt: Date
}, { timestamps: true });

module.exports = mongoose.model("Refund", refundSchema);