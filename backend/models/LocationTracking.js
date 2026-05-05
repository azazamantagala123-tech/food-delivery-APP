// ===============================
// models/LocationTracking.js
// ===============================
const mongoose = require("mongoose");

const locationTrackingSchema = new mongoose.Schema(
{
    deliveryBoy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        default: null
    },

    latitude: {
        type: Number,
        required: true
    },

    longitude: {
        type: Number,
        required: true
    }

},
{ timestamps: true }
);

module.exports = mongoose.model("LocationTracking", locationTrackingSchema);