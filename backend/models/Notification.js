// models/Notification.js
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ["admin", "promotion", "order", "system"],
        default: "admin"
    },
    recipients: {
        type: String,
        enum: ["all", "users", "delivery", "admin"],
        default: "all"
    },
    specificUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    data: {
        type: mongoose.Schema.Types.Mixed
    },
    isRead: {
        type: Boolean,
        default: false
    },
    sentBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    sentAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);