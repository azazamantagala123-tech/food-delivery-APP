const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    orderId: { type: String, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    deliveryBoy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    items: [{
        foodId: { type: mongoose.Schema.Types.ObjectId, ref: "Food", required: true },
        name: String,
        price: Number,
        quantity: Number,
        specialInstructions: String
    }],
    totalAmount: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 40 },
    tax: { type: Number, default: 0 },
    finalAmount: { type: Number, required: true },
    address: { type: String, required: true },
    deliveryLocation: {
        lat: Number,
        lng: Number,
        address: String
    },
    status: {
        type: String,
        enum: ["pending", "confirmed", "preparing", "ready", "assigned", "accepted", "picked_up", "out_for_delivery", "delivered", "cancelled", "refunded"],
        default: "pending"
    },
    paymentMethod: {
        type: String,
        enum: ["cod", "razorpay", "wallet", "card", "upi"],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded"],
        default: "pending"
    },
    scheduleFor: { type: Date, default: null },
    priority: { type: Boolean, default: false },
    instructions: { type: String, default: "" },
    rating: { type: Number, min: 1, max: 5, default: null },
    review: { type: String, default: "" },
    
    // Timelines
    createdAt: { type: Date, default: Date.now },
    confirmedAt: Date,
    preparingAt: Date,
    readyAt: Date,
    assignedAt: Date,
    acceptedAt: Date,
    pickedUpAt: Date,
    outForDeliveryAt: Date,
    deliveredAt: Date,
    cancelledAt: Date,
    rescheduledAt: Date,
    
    // Tracking
    tracking: {
        currentLocation: { lat: Number, lng: Number },
        lastUpdated: Date
    },
    
    // Support & Issues
    supportTicket: { type: mongoose.Schema.Types.ObjectId, ref: "SupportTicket" },
    issueReported: { type: Boolean, default: false },
    issueDescription: String,
    
    // Refund
    refundRequested: { type: Boolean, default: false },
    refundAmount: Number,
    refundStatus: { type: String, enum: ["pending", "approved", "rejected", "completed"], default: null },
    refundReason: String,
    refundProcessedAt: Date,
    
    // History
    statusHistory: [{
        status: String,
        timestamp: Date,
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        remarks: String
    }]
}, { timestamps: true });

// Generate orderId before save
orderSchema.pre("save", async function(next) {
    if (!this.orderId) {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const count = await mongoose.model("Order").countDocuments();
        this.orderId = `ORD${year}${month}${(count + 1).toString().padStart(5, '0')}`;
    }
});

module.exports = mongoose.model("Order", orderSchema);