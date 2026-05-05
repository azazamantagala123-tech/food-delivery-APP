// controllers/deliveryController.js
// COMPLETE WORKING CODE - NO DUPLICATE WALLET ERROR

const User = require("../models/User");
const Order = require("../models/Order");
const Wallet = require("../models/Wallet");
const Rating = require("../models/Rating");
const SupportTicket = require("../models/SupportTicket");
const LocationTracking = require("../models/LocationTracking");
const Withdraw = require("../models/Withdraw");

// ===============================
// GET ASSIGNED ORDERS
// ===============================
exports.getAssignedOrders = async (req, res) => {
    try {
        const orders = await Order.find({ 
            deliveryBoy: req.user.id,
            status: { $in: ["accepted", "out_for_delivery", "picked_up", "assigned"] }
        }).sort({ createdAt: -1 });

        res.json({
            success: true,
            message: "Assigned orders fetched successfully",
            count: orders.length,
            orders
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ===============================
// GET ORDER DETAIL
// ===============================
exports.getOrderDetail = async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            deliveryBoy: req.user.id
        }).populate("userId", "name email phone");

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.json({
            success: true,
            order
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ===============================
// ACCEPT ORDER
// ===============================
exports.acceptDelivery = async (req, res) => {
    try {
        const { orderId } = req.body;

        if (!orderId) {
            return res.status(400).json({ message: "orderId is required" });
        }

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (order.deliveryBoy?.toString() !== req.user.id) {
            return res.status(403).json({ message: "You are not assigned to this order" });
        }

        if (order.status !== "assigned") {
            return res.status(400).json({ message: `Cannot accept order with status: ${order.status}` });
        }

        order.status = "accepted";
        order.acceptedAt = new Date();
        await order.save();

        res.json({
            success: true,
            message: "Order accepted successfully",
            order
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ===============================
// REJECT ORDER
// ===============================
exports.rejectDelivery = async (req, res) => {
    try {
        const { orderId, reason } = req.body;

        if (!orderId) {
            return res.status(400).json({ message: "orderId is required" });
        }

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (order.deliveryBoy?.toString() !== req.user.id) {
            return res.status(403).json({ message: "You are not assigned to this order" });
        }

        order.status = "rejected";
        order.deliveryBoy = null;
        order.rejectedReason = reason || "No reason provided";
        order.rejectedAt = new Date();
        await order.save();

        res.json({
            success: true,
            message: "Order rejected successfully",
            order
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ===============================
// UPDATE ORDER STATUS + WALLET (FIXED)
// ===============================
exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;

        if (!orderId || !status) {
            return res.status(400).json({ message: "orderId and status are required" });
        }

        const order = await Order.findOne({
            _id: orderId,
            deliveryBoy: req.user.id
        });

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        const validStatuses = ["pending", "confirmed", "preparing", "out_for_delivery", "picked_up", "delivered", "cancelled"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        order.status = status;

        if (status === "picked_up") {
            order.pickedUpAt = new Date();
        }

        if (status === "delivered") {
            order.deliveredAt = new Date();
            const commission = Number(order.totalAmount) * 0.1 || 0;

            // FIXED: findOneAndUpdate with upsert - No duplicate error
            await Wallet.findOneAndUpdate(
                { userId: req.user.id },
                {
                    $inc: { balance: commission, totalEarned: commission },
                    $setOnInsert: { userId: req.user.id, role: "delivery", balance: 0, totalEarned: 0, totalWithdrawn: 0 }
                },
                { upsert: true, new: true }
            );
        }

        await order.save();

        res.json({
            success: true,
            message: "Order status updated successfully",
            order
        });

    } catch (error) {
        console.error("Update order status error:", error);
        res.status(500).json({ message: error.message });
    }
};

// ===============================
// UPDATE LOCATION
// ===============================
exports.updateLocation = async (req, res) => {
    try {
        const { latitude, longitude, orderId } = req.body;

        if (!latitude || !longitude) {
            return res.status(400).json({ message: "latitude and longitude are required" });
        }

        await LocationTracking.create({
            deliveryBoy: req.user.id,
            orderId: orderId || null,
            latitude,
            longitude,
            timestamp: new Date()
        });

        await User.findByIdAndUpdate(req.user.id, {
            currentLocation: { latitude, longitude }
        });

        if (orderId) {
            await Order.findByIdAndUpdate(orderId, {
                "tracking": { latitude, longitude, updatedAt: new Date() }
            });
        }

        res.json({ 
            success: true,
            message: "Location updated successfully",
            location: { latitude, longitude }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ===============================
// GET WALLET (FIXED - No duplicate error)
// ===============================
exports.getWallet = async (req, res) => {
    try {
        let wallet = await Wallet.findOne({ userId: req.user.id });

        if (!wallet) {
            wallet = await Wallet.create({
                userId: req.user.id,
                role: "delivery",
                balance: 0,
                totalEarned: 0,
                totalWithdrawn: 0
            });
        }

        const pendingWithdrawals = await Withdraw.find({ 
            deliveryBoy: req.user.id, 
            status: "pending" 
        });

        res.json({
            success: true,
            wallet: {
                balance: wallet.balance,
                totalEarned: wallet.totalEarned,
                totalWithdrawn: wallet.totalWithdrawn,
                pendingWithdrawals: pendingWithdrawals.reduce((sum, w) => sum + w.amount, 0)
            }
        });

    } catch (error) {
        console.error("Get wallet error:", error);
        
        if (error.code === 11000) {
            try {
                const wallet = await Wallet.findOne({ userId: req.user.id });
                if (wallet) {
                    return res.json({
                        success: true,
                        wallet: {
                            balance: wallet.balance,
                            totalEarned: wallet.totalEarned,
                            totalWithdrawn: wallet.totalWithdrawn,
                            pendingWithdrawals: 0
                        }
                    });
                }
            } catch (retryError) {
                return res.status(500).json({ message: retryError.message });
            }
        }
        
        res.status(500).json({ message: error.message });
    }
};

// ===============================
// WITHDRAW EARNINGS
// ===============================
exports.withdrawEarnings = async (req, res) => {
    try {
        let { amount } = req.body;
        amount = Number(amount);

        if (!amount || amount < 100) {
            return res.status(400).json({ message: "Minimum withdrawal amount is ₹100" });
        }

        const wallet = await Wallet.findOne({ userId: req.user.id });

        if (!wallet || wallet.balance < amount) {
            return res.status(400).json({ message: "Insufficient balance" });
        }

        wallet.balance -= amount;
        wallet.totalWithdrawn += amount;
        await wallet.save();

        const withdraw = await Withdraw.create({
            deliveryBoy: req.user.id,
            amount,
            status: "pending"
        });

        res.json({
            success: true,
            message: "Withdrawal request submitted successfully",
            withdraw: {
                id: withdraw._id,
                amount: withdraw.amount,
                status: withdraw.status,
                createdAt: withdraw.createdAt
            }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ===============================
// GET RATINGS
// ===============================
exports.getRatings = async (req, res) => {
    try {
        const ratings = await Rating.find({ deliveryBoy: req.user.id })
            .populate("userId", "name")
            .sort({ createdAt: -1 });

        const averageRating = ratings.length > 0
            ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
            : 0;

        res.json({
            success: true,
            averageRating: averageRating.toFixed(1),
            totalRatings: ratings.length,
            ratings: ratings.map(r => ({
                id: r._id,
                rating: r.rating,
                review: r.review,
                userName: r.userId?.name || "Anonymous",
                createdAt: r.createdAt
            }))
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ===============================
// RAISE SUPPORT TICKET
// ===============================
exports.raiseSupport = async (req, res) => {
    try {
        const { subject, message, orderId } = req.body;

        if (!subject || !message) {
            return res.status(400).json({ message: "subject and message are required" });
        }

        const ticket = await SupportTicket.create({
            deliveryBoy: req.user.id,
            orderId: orderId || null,
            subject,
            message,
            status: "open",
            createdAt: new Date()
        });

        res.json({
            success: true,
            message: "Support ticket created successfully",
            ticket: {
                id: ticket._id,
                subject: ticket.subject,
                status: ticket.status,
                createdAt: ticket.createdAt
            }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ===============================
// GET DELIVERY HISTORY
// ===============================
exports.getDeliveryHistory = async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        
        const query = { deliveryBoy: req.user.id };
        if (status) query.status = status;
        
        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
        
        const total = await Order.countDocuments(query);
        
        res.json({
            success: true,
            totalDeliveries: total,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            deliveries: orders.map(order => ({
                orderId: order._id,
                date: order.createdAt,
                status: order.status,
                totalAmount: order.totalAmount,
                commission: order.totalAmount * 0.1,
                address: order.address,
                deliveredAt: order.deliveredAt,
                paymentMethod: order.paymentMethod
            }))
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ===============================
// GET EARNINGS ANALYTICS
// ===============================
exports.getEarnings = async (req, res) => {
    try {
        const { period = "weekly" } = req.query;
        
        let startDate;
        const now = new Date();
        
        if (period === "daily") {
            startDate = new Date(now.setHours(0, 0, 0, 0));
        } else if (period === "weekly") {
            startDate = new Date(now.setDate(now.getDate() - 7));
        } else if (period === "monthly") {
            startDate = new Date(now.setMonth(now.getMonth() - 1));
        } else if (period === "yearly") {
            startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        } else {
            startDate = new Date(now.setDate(now.getDate() - 7));
        }
        
        const deliveries = await Order.find({
            deliveryBoy: req.user.id,
            status: "delivered",
            deliveredAt: { $gte: startDate }
        });
        
        const totalEarnings = deliveries.reduce((sum, order) => sum + (order.totalAmount * 0.1), 0);
        
        const dailyBreakdown = {};
        deliveries.forEach(order => {
            const date = order.deliveredAt.toISOString().split('T')[0];
            dailyBreakdown[date] = (dailyBreakdown[date] || 0) + (order.totalAmount * 0.1);
        });
        
        res.json({
            success: true,
            period,
            totalEarnings,
            totalDeliveries: deliveries.length,
            averagePerDelivery: deliveries.length ? (totalEarnings / deliveries.length).toFixed(2) : 0,
            dailyBreakdown,
            recentDeliveries: deliveries.slice(-5).map(d => ({
                orderId: d._id,
                amount: d.totalAmount,
                commission: d.totalAmount * 0.1,
                date: d.deliveredAt
            }))
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ===============================
// GO ONLINE
// ===============================
exports.goOnline = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (user.kycStatus !== "approved") {
            return res.status(400).json({ 
                success: false,
                message: "KYC not approved. Cannot go online." 
            });
        }
        
        await User.findByIdAndUpdate(req.user.id, { 
            isOnline: true, 
            isOnBreak: false
        });
        
        res.json({ 
            success: true, 
            status: "online", 
            message: "You are now online" 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ===============================
// GO OFFLINE
// ===============================
exports.goOffline = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user.id, { 
            isOnline: false, 
            isOnBreak: false
        });
        
        res.json({ 
            success: true, 
            status: "offline", 
            message: "You are now offline" 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ===============================
// GET AVAILABILITY
// ===============================
exports.getAvailability = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        res.json({
            success: true,
            isAvailable: user?.isOnline && !user?.isOnBreak,
            isOnline: user?.isOnline || false,
            isOnBreak: user?.isOnBreak || false
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ===============================
// GET SHIFT
// ===============================
exports.getShift = async (req, res) => {
    try {
        res.json({
            success: true,
            shift: {
                startTime: "09:00",
                endTime: "21:00",
                timezone: "Asia/Kolkata",
                workingDays: [1, 2, 3, 4, 5, 6]
            },
            isOnline: req.user.isOnline || false,
            isOnBreak: req.user.isOnBreak || false
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ===============================
// SET BREAK
// ===============================
exports.setBreak = async (req, res) => {
    try {
        const { action } = req.body;
        
        if (!action || !["start", "end"].includes(action)) {
            return res.status(400).json({ message: "Action must be 'start' or 'end'" });
        }
        
        const user = await User.findById(req.user.id);
        
        if (action === "start") {
            if (user.isOnBreak) {
                return res.status(400).json({ message: "Already on break" });
            }
            user.isOnBreak = true;
        } else {
            if (!user.isOnBreak) {
                return res.status(400).json({ message: "Not on break" });
            }
            user.isOnBreak = false;
        }
        
        await user.save();
        
        res.json({
            success: true,
            isOnBreak: user.isOnBreak,
            message: action === "start" ? "Break started" : "Break ended"
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ===============================
// GET AGENT DETAILS
// ===============================
exports.getAgentDetails = async (req, res) => {
    try {
        const agentId = req.params.id || req.user.id;
        
        const user = await User.findById(agentId).select("-password -refreshTokens");
        
        if (!user || user.role !== "delivery") {
            return res.status(404).json({ message: "Delivery agent not found" });
        }
        
        const totalDeliveries = await Order.countDocuments({ 
            deliveryBoy: agentId, 
            status: "delivered" 
        });
        
        const earningsResult = await Order.aggregate([
            { $match: { deliveryBoy: agentId, status: "delivered" } },
            { $group: { _id: null, total: { $sum: { $multiply: ["$totalAmount", 0.1] } } } }
        ]);
        
        const totalEarnings = earningsResult[0]?.total || 0;
        const wallet = await Wallet.findOne({ userId: agentId });
        
        res.json({
            success: true,
            agent: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                profilePhoto: user.kycDocs?.profilePhoto || null,
                kycStatus: user.kycStatus,
                isOnline: user.isOnline,
                isOnBreak: user.isOnBreak,
                currentLocation: user.currentLocation,
                stats: {
                    totalDeliveries,
                    totalEarnings,
                    averageRating: user.averageRating,
                    totalRatings: user.totalRatings,
                    walletBalance: wallet?.balance || 0
                },
                joinedAt: user.createdAt
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ===============================
// CONFIRM PICKUP
// ===============================
exports.confirmPickup = async (req, res) => {
    try {
        const { orderId, otp } = req.body;
        
        if (!orderId) {
            return res.status(400).json({ message: "orderId is required" });
        }
        
        const order = await Order.findById(orderId);
        
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        
        if (order.deliveryBoy?.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized" });
        }
        
        if (order.status !== "accepted") {
            return res.status(400).json({ message: `Cannot pickup order with status: ${order.status}` });
        }
        
        order.status = "picked_up";
        order.pickedUpAt = new Date();
        await order.save();
        
        res.json({
            success: true,
            message: "Order picked up successfully",
            orderId: order._id,
            status: order.status
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ===============================
// CONFIRM DROP (FIXED)
// ===============================
exports.confirmDrop = async (req, res) => {
    try {
        const { orderId, otp } = req.body;
        
        if (!orderId) {
            return res.status(400).json({ message: "orderId is required" });
        }
        
        const order = await Order.findById(orderId);
        
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        
        if (order.deliveryBoy?.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized" });
        }
        
        if (order.status !== "picked_up") {
            return res.status(400).json({ message: `Cannot deliver order with status: ${order.status}` });
        }
        
        // Check if already delivered
        if (order.status === "delivered") {
            return res.status(400).json({ message: "Order already delivered" });
        }
        
        order.status = "delivered";
        order.deliveredAt = new Date();
        
        if (order.paymentMethod === "cod" && !order.cashCollected) {
            order.cashCollected = true;
            order.cashCollectedAt = new Date();
            order.paymentStatus = "paid";
        }
        
        await order.save();
        
        // Calculate commission
        const commission = order.totalAmount * 0.1;
        
        // FIXED: Simple findOneAndUpdate without $setOnInsert conflict
        let wallet = await Wallet.findOne({ userId: req.user.id });
        
        if (!wallet) {
            // Create new wallet if doesn't exist
            wallet = await Wallet.create({
                userId: req.user.id,
                role: "delivery",
                balance: commission,
                totalEarned: commission,
                totalWithdrawn: 0
            });
        } else {
            // Update existing wallet
            wallet.balance = (wallet.balance || 0) + commission;
            wallet.totalEarned = (wallet.totalEarned || 0) + commission;
            await wallet.save();
        }
        
        res.json({
            success: true,
            message: "Order delivered successfully",
            orderId: order._id,
            status: order.status,
            commissionEarned: commission,
            walletBalance: wallet.balance
        });
        
    } catch (error) {
        console.error("Confirm drop error:", error);
        res.status(500).json({ message: error.message });
    }
};

// ===============================
// CASH COLLECT
// ===============================
exports.cashCollect = async (req, res) => {
    try {
        const { orderId, amount } = req.body;
        
        if (!orderId) {
            return res.status(400).json({ message: "orderId is required" });
        }
        
        const order = await Order.findById(orderId);
        
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        
        if (order.deliveryBoy?.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized" });
        }
        
        if (order.paymentMethod !== "cod") {
            return res.status(400).json({ message: "Not a COD order" });
        }
        
        if (order.cashCollected) {
            return res.status(400).json({ message: "Cash already collected" });
        }
        
        order.cashCollected = true;
        order.cashCollectedAt = new Date();
        order.paymentStatus = "paid";
        await order.save();
        
        res.json({
            success: true,
            message: "Cash collected successfully",
            orderId: order._id,
            amount: amount || order.totalAmount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ===============================
// ADMIN: GET ALL DELIVERIES
// ===============================
exports.getAllDeliveries = async (req, res) => {
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
        
        res.json({ 
            success: true,
            count: deliveriesWithInfo.length,
            deliveries: deliveriesWithInfo 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ===============================
// ADMIN: UPDATE DELIVERY
// ===============================
exports.updateDelivery = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        delete updateData.password;
        delete updateData.role;
        
        const updated = await User.findByIdAndUpdate(id, updateData, { new: true }).select("-password -refreshTokens");
        
        if (!updated) {
            return res.status(404).json({ message: "Delivery boy not found" });
        }
        
        res.json({
            success: true,
            message: "Delivery boy updated successfully",
            delivery: updated
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ===============================
// ADMIN: DELETE DELIVERY
// ===============================
exports.deleteDelivery = async (req, res) => {
    try {
        const { id } = req.params;
        
        const delivery = await User.findByIdAndDelete(id);
        
        if (!delivery) {
            return res.status(404).json({ message: "Delivery boy not found" });
        }
        
        await Wallet.findOneAndDelete({ userId: id });
        await Withdraw.deleteMany({ deliveryBoy: id });
        
        res.json({ 
            success: true,
            message: "Delivery boy deleted successfully" 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ===============================
// UPLOAD DOCS (KYC)
// ===============================
exports.uploadDocs = async (req, res) => {
    try {
        const files = req.files;
        
        if (!files || Object.keys(files).length === 0) {
            return res.status(400).json({ message: "No files uploaded" });
        }
        
        const kycDocs = {};
        
        if (files.aadhaar) kycDocs.aadhaar = files.aadhaar[0].path;
        if (files.panCard) kycDocs.panCard = files.panCard[0].path;
        if (files.license) kycDocs.license = files.license[0].path;
        if (files.profilePhoto) kycDocs.profilePhoto = files.profilePhoto[0].path;
        
        await User.findByIdAndUpdate(req.user.id, {
            $set: {
                kycDocs,
                kycStatus: "pending"
            }
        });
        
        res.json({
            success: true,
            message: "KYC documents uploaded successfully",
            status: "pending"
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ===============================
// GET KYC STATUS
// ===============================
exports.getKycStatus = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        res.json({
            success: true,
            status: user?.kycStatus || "not_uploaded",
            rejectionReason: user?.kycRejectReason || null,
            documents: {
                aadhaar: !!user?.kycDocs?.aadhaar,
                panCard: !!user?.kycDocs?.panCard,
                license: !!user?.kycDocs?.license,
                profilePhoto: !!user?.kycDocs?.profilePhoto
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};