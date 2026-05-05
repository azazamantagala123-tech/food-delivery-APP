// models/FraudLog.js
const mongoose = require("mongoose");

const fraudLogSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ["fake_order", "coupon_abuse", "fake_review", "payment_fraud", "other"],
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order"
    },
    description: String,
    severity: {
        type: String,
        enum: ["low", "medium", "high", "critical"],
        default: "medium"
    },
    status: {
        type: String,
        enum: ["pending", "investigating", "resolved", "false_alarm"],
        default: "pending"
    },
    actionTaken: String,
    resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    metadata: mongoose.Schema.Types.Mixed
}, { timestamps: true });

module.exports = mongoose.model("FraudLog", fraudLogSchema);