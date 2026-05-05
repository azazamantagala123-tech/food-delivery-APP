// models/Complaint.js
const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order"
    },
    type: {
        type: String,
        enum: ["order", "delivery", "food", "payment", "other"],
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    attachments: [String],
    status: {
        type: String,
        enum: ["pending", "in-progress", "resolved", "rejected"],
        default: "pending"
    },
    resolution: {
        type: String,
        default: ""
    },
    resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    resolvedAt: Date
}, { timestamps: true });

module.exports = mongoose.model("Complaint", complaintSchema);