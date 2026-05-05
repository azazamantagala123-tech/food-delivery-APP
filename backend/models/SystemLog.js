// models/SystemLog.js
const mongoose = require("mongoose");

const systemLogSchema = new mongoose.Schema({
    level: {
        type: String,
        enum: ["info", "warning", "error", "critical"],
        default: "info"
    },
    type: {
        type: String,
        enum: ["system", "order", "payment", "user", "delivery", "admin"],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    details: mongoose.Schema.Types.Mixed,
    ip: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    userAgent: String
}, { timestamps: true });

module.exports = mongoose.model("SystemLog", systemLogSchema);