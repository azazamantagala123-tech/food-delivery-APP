// models/Address.js
const mongoose = require("mongoose");
const addressSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    label: { type: String, default: "Home" },
    address: { type: String, required: true },
    city: String,
    state: String,
    pincode: String,
    phone: String,
    isDefault: { type: Boolean, default: false }
}, { timestamps: true });
module.exports = mongoose.model("Address", addressSchema);