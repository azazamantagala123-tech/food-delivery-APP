// ===============================
// models/SupportTicket.js
// ===============================
const mongoose = require("mongoose");

const supportTicketSchema = new mongoose.Schema(
{
    deliveryBoy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    subject: {
        type: String,
        required: true
    },

    message: {
        type: String,
        required: true
    },

    status: {
        type: String,
        enum: ["open", "in_progress", "resolved"],
        default: "open"
    }

},
{ timestamps: true }
);

module.exports = mongoose.model("SupportTicket", supportTicketSchema);