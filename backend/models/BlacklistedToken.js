const mongoose = require("mongoose");

const blacklistedTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        index: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60 * 15 // 15 minutes
    }
});

module.exports = mongoose.model("BlacklistedToken", blacklistedTokenSchema);