// controllers/adminController.js
// COMPLETE ADMIN CONTROLLER WITH ALL MISSING APIS

const bcrypt = require("bcrypt");
const User = require("../models/User");
const Order = require("../models/Order");
const Wallet = require("../models/Wallet");
const Food = require("../models/Food");
const Withdraw = require("../models/Withdraw");
const Category = require("../models/Category");
const Offer = require("../models/Offer");
const Review = require("../models/Review");
const Complaint = require("../models/Complaint");
const Refund = require("../models/Refund");
const Settings = require("../models/Settings");
const SystemLog = require("../models/SystemLog");
const FraudLog = require("../models/FraudLog");

// ==============================
// CREATE DELIVERY BOY
// ==============================
exports.createDelivery = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const deliveryUser = await User.create({
            name,
            email,
            password: hashedPassword,
            phone: phone || "",
            role: "delivery",
            kycStatus: "not_uploaded"
        });

        await Wallet.create({
            userId: deliveryUser._id,
            role: "delivery",
            balance: 0,
            totalEarned: 0,
            totalWithdrawn: 0
        });

        res.status(201).json({
            success: true,
            message: "Delivery boy created successfully",
            deliveryBoy: {
                id: deliveryUser._id,
                name: deliveryUser.name,
                email: deliveryUser.email,
                role: deliveryUser.role,
                kycStatus: deliveryUser.kycStatus
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==============================
// GET ALL DELIVERY BOYS
// ==============================
exports.getAllDeliveryBoys = async (req, res) => {
    try {
        const deliveries = await User.find({ role: "delivery" })
            .select("-password -refreshTokens")
            .lean();

        const deliveriesWithInfo = await Promise.all(deliveries.map(async (delivery) => {
            const stats = await Order.aggregate([
                { $match: { deliveryBoy: delivery._id, status: "delivered" } },
                { $group: { _id: null, count: { $sum: 1 }, earnings: { $sum: { $multiply: ["$totalAmount", 0.1] } } } }
            ]);

            const wallet = await Wallet.findOne({ userId: delivery._id });

            return {
                ...delivery,
                stats: {
                    totalDeliveries: stats[0]?.count || 0,
                    totalEarnings: stats[0]?.earnings || 0,
                    walletBalance: wallet?.balance || 0
                }
            };
        }));

        res.json({ success: true, count: deliveriesWithInfo.length, deliveries: deliveriesWithInfo });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==============================
// GET DELIVERY BOY BY ID
// ==============================
exports.getDeliveryBoyById = async (req, res) => {
    try {
        const { id } = req.params;
        const delivery = await User.findOne({ _id: id, role: "delivery" })
            .select("-password -refreshTokens");

        if (!delivery) {
            return res.status(404).json({ success: false, message: "Delivery boy not found" });
        }

        const stats = await Order.aggregate([
            { $match: { deliveryBoy: delivery._id, status: "delivered" } },
            { $group: { _id: null, count: { $sum: 1 }, earnings: { $sum: { $multiply: ["$totalAmount", 0.1] } } } }
        ]);

        const wallet = await Wallet.findOne({ userId: delivery._id });

        res.json({
            success: true,
            delivery: {
                ...delivery.toObject(),
                stats: {
                    totalDeliveries: stats[0]?.count || 0,
                    totalEarnings: stats[0]?.earnings || 0,
                    walletBalance: wallet?.balance || 0
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==============================
// UPDATE DELIVERY BOY
// ==============================
exports.updateDeliveryBoy = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        delete updateData.password;
        delete updateData.role;

        const updated = await User.findByIdAndUpdate(id, updateData, { new: true })
            .select("-password -refreshTokens");

        if (!updated) {
            return res.status(404).json({ success: false, message: "Delivery boy not found" });
        }

        res.json({ success: true, message: "Delivery boy updated successfully", delivery: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==============================
// DELETE DELIVERY BOY
// ==============================
exports.deleteDeliveryBoy = async (req, res) => {
    try {
        const { id } = req.params;

        const delivery = await User.findByIdAndDelete(id);

        if (!delivery) {
            return res.status(404).json({ success: false, message: "Delivery boy not found" });
        }

        await Wallet.findOneAndDelete({ userId: id });
        await Withdraw.deleteMany({ deliveryBoy: id });

        res.json({ success: true, message: "Delivery boy deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==============================
// ✅ APPROVE KYC
// ==============================
exports.approveKYC = async (req, res) => {
    try {
        const { deliveryBoyId } = req.body;

        if (!deliveryBoyId) {
            return res.status(400).json({ success: false, message: "deliveryBoyId is required" });
        }

        const deliveryBoy = await User.findByIdAndUpdate(
            deliveryBoyId,
            { 
                kycStatus: "approved", 
                kycRejectReason: "" 
            },
            { new: true }
        ).select("-password -refreshTokens");

        if (!deliveryBoy || deliveryBoy.role !== "delivery") {
            return res.status(404).json({ success: false, message: "Delivery boy not found" });
        }

        res.json({
            success: true,
            message: "KYC approved successfully",
            deliveryBoy: {
                id: deliveryBoy._id,
                name: deliveryBoy.name,
                email: deliveryBoy.email,
                kycStatus: deliveryBoy.kycStatus
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==============================
// ❌ REJECT KYC
// ==============================
exports.rejectKYC = async (req, res) => {
    try {
        const { deliveryBoyId, reason } = req.body;

        if (!deliveryBoyId) {
            return res.status(400).json({ success: false, message: "deliveryBoyId is required" });
        }

        const deliveryBoy = await User.findByIdAndUpdate(
            deliveryBoyId,
            { 
                kycStatus: "rejected", 
                kycRejectReason: reason || "No reason provided" 
            },
            { new: true }
        ).select("-password -refreshTokens");

        if (!deliveryBoy || deliveryBoy.role !== "delivery") {
            return res.status(404).json({ success: false, message: "Delivery boy not found" });
        }

        res.json({
            success: true,
            message: "KYC rejected",
            deliveryBoy: {
                id: deliveryBoy._id,
                name: deliveryBoy.name,
                email: deliveryBoy.email,
                kycStatus: deliveryBoy.kycStatus,
                rejectionReason: deliveryBoy.kycRejectReason
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==============================
// GET PENDING KYC REQUESTS
// ==============================
exports.getPendingKYC = async (req, res) => {
    try {
        const pendingKYCDeliveries = await User.find({ 
            role: "delivery", 
            kycStatus: "pending" 
        }).select("-password -refreshTokens");

        res.json({
            success: true,
            count: pendingKYCDeliveries.length,
            pendingRequests: pendingKYCDeliveries.map(d => ({
                id: d._id,
                name: d.name,
                email: d.email,
                kycDocs: d.kycDocs,
                submittedAt: d.updatedAt
            }))
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==============================
// GET ALL KYC REQUESTS
// ==============================
exports.getAllKYCRequests = async (req, res) => {
    try {
        const allKYCDeliveries = await User.find({ 
            role: "delivery",
            kycStatus: { $in: ["pending", "approved", "rejected"] }
        }).select("-password -refreshTokens");

        res.json({
            success: true,
            count: allKYCDeliveries.length,
            requests: allKYCDeliveries
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==============================
// ADMIN DASHBOARD STATS
// ==============================
exports.getAdminStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: "user" });
        const totalDeliveryBoys = await User.countDocuments({ role: "delivery" });
        const pendingKYC = await User.countDocuments({ role: "delivery", kycStatus: "pending" });
        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({ status: "pending" });
        const deliveredOrders = await Order.countDocuments({ status: "delivered" });

        const totalRevenue = await Order.aggregate([
            { $match: { status: "delivered" } },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ]);

        const totalFoods = await Food.countDocuments();

        res.json({
            success: true,
            stats: {
                totalUsers,
                totalDeliveryBoys,
                pendingKYC,
                totalOrders,
                pendingOrders,
                deliveredOrders,
                totalRevenue: totalRevenue[0]?.total || 0,
                totalFoods
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==============================
// 🎫 COUPON MANAGEMENT
// ==============================

exports.createCoupon = async (req, res) => {
    try {
        const Coupon = require("../models/Coupon");
        
        const { code, description, discountType, discountValue, minOrderAmount, maxDiscount, validFrom, validUntil, usageLimit } = req.body;

        if (!code || !discountType || !discountValue || !validFrom || !validUntil) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
        if (existingCoupon) {
            return res.status(400).json({ success: false, message: "Coupon code already exists" });
        }

        const coupon = await Coupon.create({
            code: code.toUpperCase(),
            description: description || "",
            discountType,
            discountValue,
            minOrderAmount: minOrderAmount || 0,
            maxDiscount: maxDiscount || null,
            validFrom: new Date(validFrom),
            validUntil: new Date(validUntil),
            usageLimit: usageLimit || null,
            usedCount: 0,
            isActive: true
        });

        res.json({ success: true, message: "Coupon created successfully", coupon });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllCoupons = async (req, res) => {
    try {
        const Coupon = require("../models/Coupon");
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        res.json({ success: true, count: coupons.length, coupons });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getCouponById = async (req, res) => {
    try {
        const Coupon = require("../models/Coupon");
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) {
            return res.status(404).json({ success: false, message: "Coupon not found" });
        }
        res.json({ success: true, coupon });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateCoupon = async (req, res) => {
    try {
        const Coupon = require("../models/Coupon");
        const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!coupon) {
            return res.status(404).json({ success: false, message: "Coupon not found" });
        }
        res.json({ success: true, message: "Coupon updated successfully", coupon });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteCoupon = async (req, res) => {
    try {
        const Coupon = require("../models/Coupon");
        const coupon = await Coupon.findByIdAndDelete(req.params.id);
        if (!coupon) {
            return res.status(404).json({ success: false, message: "Coupon not found" });
        }
        res.json({ success: true, message: "Coupon deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.toggleCouponStatus = async (req, res) => {
    try {
        const Coupon = require("../models/Coupon");
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) {
            return res.status(404).json({ success: false, message: "Coupon not found" });
        }
        coupon.isActive = !coupon.isActive;
        await coupon.save();
        res.json({ success: true, message: `Coupon ${coupon.isActive ? "activated" : "deactivated"} successfully`, isActive: coupon.isActive });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==============================
// ADMIN MANAGEMENT
// ==============================

exports.createAdmin = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        const existingAdmin = await User.findOne({ role: "admin" });
        if (existingAdmin) {
            return res.status(400).json({ success: false, message: "Admin already exists! Only one admin is allowed." });
        }

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "Name, email and password are required" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const adminUser = await User.create({
            name, email, password: hashedPassword, phone: phone || "", role: "admin", kycStatus: "approved"
        });

        const adminResponse = adminUser.toObject();
        delete adminResponse.password;
        delete adminResponse.refreshTokens;

        res.status(201).json({ success: true, message: "Admin created successfully", admin: adminResponse });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteAdmin = async (req, res) => {
    try {
        const admin = await User.findOne({ role: "admin" });
        if (!admin) {
            return res.status(404).json({ success: false, message: "No admin found to delete" });
        }
        await User.findByIdAndDelete(admin._id);
        res.json({ success: true, message: "Admin deleted successfully", deletedAdmin: { id: admin._id, name: admin.name, email: admin.email } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAdmin = async (req, res) => {
    try {
        const admin = await User.findOne({ role: "admin" }).select("-password -refreshTokens");
        if (!admin) {
            return res.status(404).json({ success: false, message: "No admin found" });
        }
        res.json({ success: true, admin });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==============================
// USER MANAGEMENT (NEW)
// ==============================

// controllers/adminController.js mein ye function update karo

exports.getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 20, search, status } = req.query;
        
        // Sirf role: "user" wale dikhane ke liye
        let query = { role: "user" };  // ✅ YEH LINE ADD KARI
        
        if (status === "active") query.isBlocked = false;
        if (status === "blocked") query.isBlocked = true;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { phone: { $regex: search, $options: "i" } }
            ];
        }
        
        const users = await User.find(query)
            .select("-password -refreshTokens")
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
            
        const total = await User.countDocuments(query);
        
        res.json({
            success: true,
            users,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// controllers/adminController.js mein ye naya function add karo

// SIRF CUSTOMERS (role: "user")
exports.getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 20, search, status } = req.query;
        
        // ✅ SIRF role: "user" wale users
        let query = { role: "user" };
        
        if (status === "active") query.isBlocked = false;
        if (status === "blocked") query.isBlocked = true;
        
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { phone: { $regex: search, $options: "i" } }
            ];
        }
        
        const users = await User.find(query)
            .select("-password -refreshTokens")
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
            
        const total = await User.countDocuments(query);
        
        // Extra stats for customers
        const activeCustomers = await User.countDocuments({ role: "user", isBlocked: false });
        const blockedCustomers = await User.countDocuments({ role: "user", isBlocked: true });
        
        res.json({
            success: true,
            customers: users,  // Key name "customers" for clarity
            stats: {
                total,
                active: activeCustomers,
                blocked: blockedCustomers
            },
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            total
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// SABHI USERS (admin + delivery + user) - Optional
exports.getAllUsersWithRoles = async (req, res) => {
    try {
        const { page = 1, limit = 20, role, search } = req.query;
        
        let query = {};
        if (role) query.role = role;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } }
            ];
        }
        
        const users = await User.find(query)
            .select("-password -refreshTokens")
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
            
        const total = await User.countDocuments(query);
        
        // Group by role
        const roleStats = await User.aggregate([
            { $group: { _id: "$role", count: { $sum: 1 } } }
        ]);
        
        res.json({
            success: true,
            users,
            roleStats,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id).select("-password -refreshTokens");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        
        const orders = await Order.find({ user: id });
        const totalOrders = orders.length;
        const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);
        
        res.json({ success: true, user: { ...user.toObject(), stats: { totalOrders, totalSpent, averageOrderValue: totalOrders > 0 ? totalSpent / totalOrders : 0 } } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.blockUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        
        user.isBlocked = !user.isBlocked;
        user.blockReason = user.isBlocked ? reason || "No reason provided" : "";
        await user.save();
        
        await SystemLog.create({ level: "info", type: "admin", message: `User ${user.isBlocked ? "blocked" : "unblocked"}: ${user.email}`, user: req.user._id });
        
        res.json({ success: true, message: `User ${user.isBlocked ? "blocked" : "unblocked"} successfully`, isBlocked: user.isBlocked });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getDeliveryBoyDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const delivery = await User.findOne({ _id: id, role: "delivery" }).select("-password -refreshTokens");
        if (!delivery) {
            return res.status(404).json({ success: false, message: "Delivery boy not found" });
        }
        
        const stats = await Order.aggregate([
            { $match: { deliveryBoy: delivery._id, status: "delivered" } },
            { $group: { _id: null, count: { $sum: 1 }, earnings: { $sum: { $multiply: ["$totalAmount", 0.1] } } } }
        ]);
        
        const wallet = await Wallet.findOne({ userId: delivery._id });
        const completedOrders = await Order.countDocuments({ deliveryBoy: id, status: "delivered" });
        const pendingOrders = await Order.countDocuments({ deliveryBoy: id, status: { $in: ["assigned", "picked_up"] } });
        
        res.json({ success: true, delivery: { ...delivery.toObject(), stats: { totalDeliveries: stats[0]?.count || 0, totalEarnings: stats[0]?.earnings || 0, walletBalance: wallet?.balance || 0, completedOrders, pendingOrders, rating: delivery.averageRating || 0 } } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==============================
// ORDER MANAGEMENT (MISSING)
// ==============================

exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId, status, remarks } = req.body;
        
        const validStatuses = ["pending", "confirmed", "preparing", "ready", "assigned", "picked_up", "delivered", "cancelled"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status" });
        }
        
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }
        
        order.status = status;
        order.statusHistory = order.statusHistory || [];
        order.statusHistory.push({ status, timestamp: new Date(), updatedBy: req.user._id, remarks });
        await order.save();
        
        await SystemLog.create({ level: "info", type: "order", message: `Order ${order.orderId} status updated to ${status}`, user: req.user._id, details: { orderId, status, remarks } });
        
        res.json({ success: true, message: "Order status updated successfully", order: { id: order._id, orderId: order.orderId, status: order.status, statusHistory: order.statusHistory } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getLiveOrders = async (req, res) => {
    try {
        const liveStatuses = ["confirmed", "preparing", "ready", "assigned", "picked_up"];
        
        const liveOrders = await Order.find({ status: { $in: liveStatuses }, isLive: true })
            .populate("user", "name phone")
            .populate("deliveryBoy", "name phone currentLocation")
            .populate("items.food", "name price images")
            .sort({ createdAt: -1 });
        
        const ordersWithETA = liveOrders.map(order => ({ ...order.toObject(), estimatedDelivery: order.estimatedDeliveryTime || new Date(Date.now() + 30 * 60000) }));
        
        res.json({ success: true, count: ordersWithETA.length, orders: ordersWithETA });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==============================
// OFFERS MANAGEMENT
// ==============================

exports.createOffer = async (req, res) => {
    try {
        const offerData = req.body;
        if (!offerData.title || !offerData.discountType || !offerData.discountValue || !offerData.validFrom || !offerData.validUntil) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }
        
        const offer = await Offer.create(offerData);
        await SystemLog.create({ level: "info", type: "admin", message: `New offer created: ${offer.title}`, user: req.user._id });
        
        res.json({ success: true, message: "Offer created successfully", offer });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllOffers = async (req, res) => {
    try {
        const { isActive, page = 1, limit = 20 } = req.query;
        let query = {};
        if (isActive !== undefined) query.isActive = isActive === "true";
        
        const offers = await Offer.find(query).sort({ createdAt: -1 }).limit(limit * 1).skip((page - 1) * limit);
        const total = await Offer.countDocuments(query);
        
        res.json({ success: true, offers, totalPages: Math.ceil(total / limit), currentPage: page, total });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteOffer = async (req, res) => {
    try {
        const { id } = req.params;
        const offer = await Offer.findByIdAndDelete(id);
        if (!offer) {
            return res.status(404).json({ success: false, message: "Offer not found" });
        }
        
        await SystemLog.create({ level: "info", type: "admin", message: `Offer deleted: ${offer.title}`, user: req.user._id });
        res.json({ success: true, message: "Offer deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==============================
// CATEGORY MANAGEMENT
// ==============================

exports.createCategory = async (req, res) => {
    try {
        const { name, description, image, sortOrder } = req.body;
        if (!name) {
            return res.status(400).json({ success: false, message: "Category name is required" });
        }
        
        const existing = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });
        if (existing) {
            return res.status(400).json({ success: false, message: "Category already exists" });
        }
        
        const category = await Category.create({ name, description, image, sortOrder });
        res.json({ success: true, message: "Category created successfully", category });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllCategories = async (req, res) => {
    try {
        const { isActive } = req.query;
        let query = {};
        if (isActive !== undefined) query.isActive = isActive === "true";
        
        const categories = await Category.find(query).sort({ sortOrder: 1, name: 1 });
        const categoriesWithCount = await Promise.all(categories.map(async (cat) => {
            const foodCount = await Food.countDocuments({ category: cat._id });
            return { ...cat.toObject(), foodCount };
        }));
        
        res.json({ success: true, categories: categoriesWithCount });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        const category = await Category.findByIdAndUpdate(id, updateData, { new: true });
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }
        
        res.json({ success: true, message: "Category updated successfully", category });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const foodCount = await Food.countDocuments({ category: id });
        if (foodCount > 0) {
            return res.status(400).json({ success: false, message: `Cannot delete category. ${foodCount} food items are associated with this category.` });
        }
        
        const category = await Category.findByIdAndDelete(id);
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }
        
        res.json({ success: true, message: "Category deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==============================
// ANALYTICS & REPORTS
// ==============================

exports.getAnalytics = async (req, res) => {
    try {
        const { period = "week" } = req.query;
        let startDate = new Date();
        if (period === "week") startDate.setDate(startDate.getDate() - 7);
        else if (period === "month") startDate.setMonth(startDate.getMonth() - 1);
        else if (period === "year") startDate.setFullYear(startDate.getFullYear() - 1);
        
        const ordersAnalytics = await Order.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 }, revenue: { $sum: "$totalAmount" } } },
            { $sort: { _id: 1 } }
        ]);
        
        const popularFoods = await Order.aggregate([
            { $unwind: "$items" },
            { $group: { _id: "$items.food", totalSold: { $sum: "$items.quantity" }, totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } } } },
            { $sort: { totalSold: -1 } },
            { $limit: 10 },
            { $lookup: { from: "foods", localField: "_id", foreignField: "_id", as: "food" } },
            { $unwind: "$food" }
        ]);
        
        const userGrowth = await User.aggregate([
            { $match: { createdAt: { $gte: startDate }, role: "user" } },
            { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, newUsers: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);
        
        res.json({ success: true, analytics: { period, orders: ordersAnalytics, popularFoods, userGrowth, summary: { totalOrders: ordersAnalytics.reduce((sum, d) => sum + d.count, 0), totalRevenue: ordersAnalytics.reduce((sum, d) => sum + d.revenue, 0), newUsers: userGrowth.reduce((sum, d) => sum + d.newUsers, 0) } } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getRevenueReports = async (req, res) => {
    try {
        const { type = "daily", from, to } = req.query;
        let startDate = from ? new Date(from) : new Date();
        let endDate = to ? new Date(to) : new Date();
        if (!from) startDate.setDate(startDate.getDate() - 30);
        
        let groupBy;
        if (type === "daily") groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
        else if (type === "monthly") groupBy = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
        else groupBy = { $dateToString: { format: "%Y", date: "$createdAt" } };
        
        const revenue = await Order.aggregate([
            { $match: { createdAt: { $gte: startDate, $lte: endDate }, status: "delivered" } },
            { $group: { _id: groupBy, totalRevenue: { $sum: "$totalAmount" }, totalOrders: { $sum: 1 }, avgOrderValue: { $avg: "$totalAmount" } } },
            { $sort: { _id: 1 } }
        ]);
        
        const summary = { totalRevenue: revenue.reduce((sum, r) => sum + r.totalRevenue, 0), totalOrders: revenue.reduce((sum, r) => sum + r.totalOrders, 0), averageOrderValue: revenue.length > 0 ? revenue.reduce((sum, r) => sum + r.avgOrderValue, 0) / revenue.length : 0 };
        
        res.json({ success: true, type, revenue, summary });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getCustomReports = async (req, res) => {
    try {
        const { startDate, endDate, metrics } = req.body;
        const query = {};
        if (startDate) query.createdAt = { $gte: new Date(startDate) };
        if (endDate) query.createdAt = { ...query.createdAt, $lte: new Date(endDate) };
        
        const report = {};
        if (metrics.includes("orders") || metrics.includes("all")) {
            report.orders = await Order.countDocuments(query);
            report.orderValue = await Order.aggregate([{ $match: query }, { $group: { _id: null, total: { $sum: "$totalAmount" }, avg: { $avg: "$totalAmount" } } }]);
        }
        if (metrics.includes("users") || metrics.includes("all")) {
            report.newUsers = await User.countDocuments({ ...query, role: "user" });
            report.totalUsers = await User.countDocuments({ role: "user" });
        }
        if (metrics.includes("foods") || metrics.includes("all")) {
            report.topFoods = await Order.aggregate([{ $match: query }, { $unwind: "$items" }, { $group: { _id: "$items.food", totalSold: { $sum: "$items.quantity" } } }, { $sort: { totalSold: -1 } }, { $limit: 10 }, { $lookup: { from: "foods", localField: "_id", foreignField: "_id", as: "food" } }]);
        }
        
        res.json({ success: true, report });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getFraudLogs = async (req, res) => {
    try {
        const { status, severity, page = 1, limit = 20 } = req.query;
        let query = {};
        if (status) query.status = status;
        if (severity) query.severity = severity;
        
        const frauds = await FraudLog.find(query).populate("user", "name email phone").populate("order", "orderId totalAmount").sort({ createdAt: -1 }).limit(limit * 1).skip((page - 1) * limit);
        const total = await FraudLog.countDocuments(query);
        
        res.json({ success: true, frauds, totalPages: Math.ceil(total / limit), currentPage: page, total });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==============================
// REVIEWS & COMPLAINTS
// ==============================

exports.getAllReviews = async (req, res) => {
    try {
        const { rating, isHidden, page = 1, limit = 20 } = req.query;
        let query = {};
        if (rating) query.rating = parseInt(rating);
        if (isHidden !== undefined) query.isHidden = isHidden === "true";
        
        const reviews = await Review.find(query).populate("user", "name email phone").populate("food", "name price images").populate("order", "orderId").sort({ createdAt: -1 }).limit(limit * 1).skip((page - 1) * limit);
        const total = await Review.countDocuments(query);
        const averageRating = await Review.aggregate([{ $match: { isHidden: false } }, { $group: { _id: null, avg: { $avg: "$rating" } } }]);
        
        res.json({ success: true, reviews, averageRating: averageRating[0]?.avg || 0, totalPages: Math.ceil(total / limit), currentPage: page, total });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const review = await Review.findByIdAndDelete(id);
        if (!review) {
            return res.status(404).json({ success: false, message: "Review not found" });
        }
        
        await SystemLog.create({ level: "warning", type: "admin", message: `Review deleted by admin: ${review._id}`, user: req.user._id });
        res.json({ success: true, message: "Review deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllComplaints = async (req, res) => {
    try {
        const { status, type, page = 1, limit = 20 } = req.query;
        let query = {};
        if (status) query.status = status;
        if (type) query.type = type;
        
        const complaints = await Complaint.find(query).populate("user", "name email phone").populate("order", "orderId totalAmount").populate("resolvedBy", "name email").sort({ createdAt: -1 }).limit(limit * 1).skip((page - 1) * limit);
        const total = await Complaint.countDocuments(query);
        
        res.json({ success: true, complaints, totalPages: Math.ceil(total / limit), currentPage: page, total });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==============================
// FINANCIAL MANAGEMENT
// ==============================

exports.approveRefund = async (req, res) => {
    try {
        const { refundId, remarks } = req.body;
        const refund = await Refund.findById(refundId).populate("user");
        if (!refund) {
            return res.status(404).json({ success: false, message: "Refund request not found" });
        }
        
        refund.status = "approved";
        refund.remarks = remarks;
        refund.processedBy = req.user._id;
        refund.processedAt = new Date();
        await refund.save();
        
        const wallet = await Wallet.findOne({ userId: refund.user._id });
        if (wallet) {
            wallet.balance += refund.amount;
            await wallet.save();
            wallet.transactions = wallet.transactions || [];
            wallet.transactions.push({ type: "credit", amount: refund.amount, description: `Refund for order ${refund.order}`, reference: refund._id });
            await wallet.save();
        }
        
        await SystemLog.create({ level: "info", type: "payment", message: `Refund approved for user ${refund.user.email}: ₹${refund.amount}`, user: req.user._id });
        res.json({ success: true, message: "Refund approved successfully", refund });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.rejectRefund = async (req, res) => {
    try {
        const { refundId, remarks } = req.body;
        const refund = await Refund.findById(refundId);
        if (!refund) {
            return res.status(404).json({ success: false, message: "Refund request not found" });
        }
        
        refund.status = "rejected";
        refund.remarks = remarks;
        refund.processedBy = req.user._id;
        refund.processedAt = new Date();
        await refund.save();
        
        await SystemLog.create({ level: "warning", type: "payment", message: `Refund rejected for user: ${refund.user}`, user: req.user._id });
        res.json({ success: true, message: "Refund rejected", refund });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==============================
// SYSTEM & NOTIFICATIONS
// ==============================

exports.getSystemLogs = async (req, res) => {
    try {
        const { level, type, page = 1, limit = 50 } = req.query;
        let query = {};
        if (level) query.level = level;
        if (type) query.type = type;
        
        const logs = await SystemLog.find(query).populate("user", "name email role").sort({ createdAt: -1 }).limit(limit * 1).skip((page - 1) * limit);
        const total = await SystemLog.countDocuments(query);
        
        res.json({ success: true, logs, totalPages: Math.ceil(total / limit), currentPage: page, total });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.sendNotification = async (req, res) => {
    try {
        const { title, message, type, userIds, data } = req.body;
        
        if (!title || !message) {
            return res.status(400).json({ success: false, message: "Title and message are required" });
        }
        
        // Create notification in database
        const Notification = require("../models/Notification");
        const notification = await Notification.create({
            title, message, type: type || "admin", recipients: userIds || "all", data, sentBy: req.user._id
        });
        
        // Here you can integrate FCM for push notifications
        // For now, just log it
        await SystemLog.create({ level: "info", type: "admin", message: `Notification sent: ${title}`, user: req.user._id });
        
        res.json({ success: true, message: "Notification sent successfully", notification });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.sendPushNotification = async (req, res) => {
    try {
        const { title, message, userIds, data } = req.body;
        
        if (!title || !message) {
            return res.status(400).json({ success: false, message: "Title and message are required" });
        }
        
        // Integrate FCM here
        // For now, just log it
        await SystemLog.create({ level: "info", type: "admin", message: `Push notification sent: ${title}`, user: req.user._id });
        
        res.json({ success: true, message: "Push notification sent successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getSystemHealth = async (req, res) => {
    try {
        const mongoose = require("mongoose");
        const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
        
        const uptime = process.uptime();
        const memoryUsage = process.memoryUsage();
        
        res.json({ success: true, health: { database: dbStatus, uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`, memory: { rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`, heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`, heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB` }, timestamp: new Date() } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.toggleFeature = async (req, res) => {
    try {
        const { feature, enabled } = req.body;
        
        if (!feature) {
            return res.status(400).json({ success: false, message: "Feature name is required" });
        }
        
        let settings = await Settings.findOne({ key: `feature_${feature}` });
        if (!settings) {
            settings = await Settings.create({ key: `feature_${feature}`, value: enabled || false });
        } else {
            settings.value = enabled;
            await settings.save();
        }
        
        await SystemLog.create({ level: "info", type: "admin", message: `Feature ${feature} ${enabled ? "enabled" : "disabled"}`, user: req.user._id });
        
        res.json({ success: true, message: `Feature ${feature} ${enabled ? "enabled" : "disabled"} successfully`, feature, enabled });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getSettings = async (req, res) => {
    try {
        const { public: isPublic } = req.query;
        let query = {};
        if (isPublic === "true") query.isPublic = true;
        
        const settings = await Settings.find(query);
        const settingsObject = {};
        settings.forEach(s => { settingsObject[s.key] = s.value; });
        
        res.json({ success: true, settings: settingsObject });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        const settingsData = req.body;
        
        for (const [key, value] of Object.entries(settingsData)) {
            await Settings.findOneAndUpdate({ key }, { key, value }, { upsert: true, new: true });
        }
        
        await SystemLog.create({ level: "info", type: "admin", message: "System settings updated", user: req.user._id });
        
        res.json({ success: true, message: "Settings updated successfully", settings: settingsData });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};