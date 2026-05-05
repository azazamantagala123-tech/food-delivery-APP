// models/Feedback.js
const mongoose = require("mongoose");
const feedbackSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, min: 1, max: 5 },
    message: String
}, { timestamps: true });
module.exports = mongoose.model("Feedback", feedbackSchema);