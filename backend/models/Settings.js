// models/Settings.js
const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true
    },
    value: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    description: String,
    isPublic: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// ✅ Create and export the MODEL
const Settings = mongoose.model("Settings", settingsSchema);

// Default settings data
const defaultSettings = [
    { key: "app_name", value: "Food Delivery App", isPublic: true },
    { key: "app_version", value: "1.0.0", isPublic: true },
    { key: "delivery_charge", value: 40, isPublic: false },
    { key: "min_order_amount", value: 99, isPublic: false },
    { key: "delivery_boy_commission", value: 10, isPublic: false },
    { key: "max_distance_km", value: 10, isPublic: false },
    { key: "maintenance_mode", value: false, isPublic: true },
    { key: "allow_pickup", value: true, isPublic: true },
    { key: "contact_email", value: "support@foodapp.com", isPublic: true },
    { key: "contact_phone", value: "+91 9876543210", isPublic: true }
];

// ✅ Export both
module.exports = Settings;
module.exports.defaultSettings = defaultSettings;