// models/User.js - Fix the pre-save hook

const mongoose = require("mongoose");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true },
        phone: { type: String, default: "" },
        role: { type: String, enum: ["user", "delivery", "admin"], default: "user" },
        
        // Referral fields
        referralCode: {
            type: String,
            unique: true,
            sparse: true
        },
        referredBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },
        rewardPoints: {
            type: Number,
            default: 0
        },
        
        isEmailVerified: { type: Boolean, default: true },
        twoFactorSecret: { type: String, default: null },
        twoFactorEnabled: { type: Boolean, default: false },
        socialProvider: { type: String, enum: ["google", "facebook", "apple", null], default: null },
        socialId: { type: String, default: null },
        
        devices: [{
            deviceId: { type: String, required: true },
            deviceName: { type: String, default: "Unknown Device" },
            deviceType: { type: String, enum: ["mobile", "tablet", "web"], default: "web" },
            fcmToken: { type: String, default: null },
            lastUsed: { type: Date, default: Date.now }
        }],
        
        biometricDevices: [{
            deviceId: { type: String, required: true },
            biometricKey: { type: String, required: true },
            registeredAt: { type: Date, default: Date.now }
        }],
        
        subscription: {
            plan: { type: String, enum: ["free", "premium", "gold"], default: "free" },
            startDate: { type: Date, default: null },
            status: { type: String, enum: ["active", "expired", "cancelled"], default: "active" }
        },
        
        membership: { tier: { type: String, enum: ["normal", "silver", "gold", "platinum"], default: "normal" } },
        
        preferences: {
            vegOnly: { type: Boolean, default: false },
            notificationsEnabled: { type: Boolean, default: true },
            language: { type: String, default: "en" }
        },
        
        notificationSettings: {
            orderUpdates: { type: Boolean, default: true },
            promotions: { type: Boolean, default: true },
            walletUpdates: { type: Boolean, default: true }
        },
        
        loginHistory: [{
            deviceInfo: { type: String, default: "Unknown Device" },
            ipAddress: { type: String, default: "Unknown IP" },
            loginAt: { type: Date, default: Date.now }
        }],
        
        avatar: { type: String, default: "" },
        
        kycDocs: {
            aadhaar: { type: String, default: "" },
            panCard: { type: String, default: "" },
            license: { type: String, default: "" },
            profilePhoto: { type: String, default: "" }
        },
        kycStatus: { type: String, enum: ["pending", "approved", "rejected", "not_uploaded"], default: "not_uploaded" },
        kycRejectReason: { type: String, default: "" },
        isOnline: { type: Boolean, default: false },
        isOnBreak: { type: Boolean, default: false },
        isBlocked: { type: Boolean, default: false },
        blockReason: { type: String, default: "" },
        currentLocation: { latitude: { type: Number, default: 0 }, longitude: { type: Number, default: 0 } },
        wallet: { type: mongoose.Schema.Types.ObjectId, ref: "Wallet" },
        paymentMethods: { type: Array, default: [] },
        averageRating: { type: Number, default: 0 },
        totalRatings: { type: Number, default: 0 },
        refreshTokens: [{
            token: { type: String, required: true },
            deviceInfo: { type: String, default: "Unknown Device" },
            ipAddress: { type: String, default: "Unknown IP" },
            createdAt: { type: Date, default: Date.now }
        }]
    },
    { timestamps: true }
);

// ✅ FIXED: Generate referral code before save
userSchema.pre("save", async function(next) {
    try {
        if (!this.referralCode) {
            this.referralCode = crypto.randomBytes(4).toString("hex").toUpperCase();
        }
    } catch (error) {
        next(error);
    }
});

module.exports = mongoose.model("User", userSchema);