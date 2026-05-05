// models/Issue.js
const mongoose = require("mongoose");
const issueSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    issue: String,
    description: String,
    status: { type: String, default: "pending" }
}, { timestamps: true });
module.exports = mongoose.model("Issue", issueSchema);