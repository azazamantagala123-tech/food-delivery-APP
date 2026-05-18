// controllers/authController.js
// ONLY REGISTER & LOGIN - WITH REFERRAL CODE GENERATION

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");

// Helper function to generate referral code
function generateReferralCode() {
    return crypto.randomBytes(4).toString("hex").toUpperCase();
}

// ================= USER REGISTER =================
exports.register = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        const exists = await User.findOne({ email });
        if (exists) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        const hashed = await bcrypt.hash(password, 10);

        // ✅ Generate referral code
        const referralCode = generateReferralCode();

        const user = await User.create({
            name,
            email,
            password: hashed,
            phone: phone || "",
            role: "user",
            referralCode: referralCode,  // ← Add referral codezz
            rewardPoints: 0,
            isEmailVerified: true
        });

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: { 
                id: user._id, 
                name: user.name, 
                email: user.email, 
                role: user.role,
                referralCode: user.referralCode  // ← Send referral code in response
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ================= USER LOGIN =================
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ success: false, message: "Invalid credentials" });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ success: false, message: "Invalid credentials" });

        const accessToken = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({
            success: true,
            message: "Login successful",
            accessToken,
            user: { 
                id: user._id, 
                name: user.name, 
                email: user.email, 
                role: user.role,
                referralCode: user.referralCode  // ← Send referral code in response
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ================= DELIVERY LOGIN =================
exports.deliveryLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email, role: "delivery" });
        if (!user) return res.status(400).json({ success: false, message: "Invalid credentials" });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ success: false, message: "Invalid credentials" });

        const accessToken = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({
            success: true,
            message: "Delivery login successful",
            accessToken,
            user: { 
                id: user._id, 
                name: user.name, 
                email: user.email, 
                role: user.role 
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ================= DELIVERY REGISTER =================
exports.deliveryRegister = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        const exists = await User.findOne({ email });
        if (exists) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        const hashed = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashed,
            phone: phone || "",
            role: "delivery",
            kycStatus: "not_uploaded",
            isEmailVerified: true
        });

        res.status(201).json({
            success: true,
            message: "Delivery boy registered successfully",
            user: { 
                id: user._id, 
                name: user.name, 
                email: user.email, 
                role: user.role 
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ================= ADMIN LOGIN =================
exports.adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email, role: "admin" });
        if (!user) return res.status(400).json({ success: false, message: "Invalid credentials" });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ success: false, message: "Invalid credentials" });

        const accessToken = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({
            success: true,
            message: "Admin login successful",
            accessToken,
            user: { 
                id: user._id, 
                name: user.name, 
                email: user.email, 
                role: user.role 
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};