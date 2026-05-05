// ===============================
// models/DeliveryShift.js
// ===============================
const mongoose = require("mongoose");

const deliveryShiftSchema = new mongoose.Schema(
{
    deliveryBoy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    startTime: {
        type: Date,
        required: true
    },

    endTime: {
        type: Date,
        required: true
    },

    status: {
        type: String,
        enum: ["active", "completed", "break"],
        default: "active"
    }

},
{ timestamps: true }
);

module.exports = mongoose.model("DeliveryShift", deliveryShiftSchema);