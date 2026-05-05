// models/Review.js
const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    food: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Food"
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order"
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true
    },
    images: [String],
    isVerified: {
        type: Boolean,
        default: false
    },
    isHidden: {
        type: Boolean,
        default: false
    },
    reply: {
        text: String,
        repliedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        repliedAt: Date
    }
}, { timestamps: true });

module.exports = mongoose.model("Review", reviewSchema);