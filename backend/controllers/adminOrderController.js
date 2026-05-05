// controllers/adminOrderController.js
// COMPLETE WORKING CODE - COPY PASTE

const Order = require("../models/Order");
const User = require("../models/User");

// ===============================
// ASSIGN ORDER TO DELIVERY BOY
// ===============================
exports.assignDeliveryBoy = async (req, res) => {
    try {
        const { orderId, deliveryBoyId } = req.body;

        // Validation
        if (!orderId || !deliveryBoyId) {
            return res.status(400).json({
                success: false,
                message: "orderId and deliveryBoyId are required"
            });
        }

        // Check order exists
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Check delivery boy exists
        const deliveryBoy = await User.findOne({
            _id: deliveryBoyId,
            role: "delivery"
        });
        if (!deliveryBoy) {
            return res.status(404).json({
                success: false,
                message: "Delivery boy not found"
            });
        }

        // Check if already assigned
        if (order.deliveryBoy) {
            return res.status(400).json({
                success: false,
                message: "Order already assigned to someone"
            });
        }

        // Assign delivery boy
        order.deliveryBoy = deliveryBoyId;
        order.status = "assigned";
        order.assignedAt = new Date();
        await order.save();

        res.json({
            success: true,
            message: "Order assigned successfully",
            order: {
                id: order._id,
                status: order.status,
                deliveryBoy: {
                    id: deliveryBoy._id,
                    name: deliveryBoy.name
                }
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ===============================
// GET ALL ORDERS (ADMIN)
// ===============================
exports.getAllOrders = async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        
        const query = {};
        if (status) query.status = status;
        
        const orders = await Order.find(query)
            .populate("userId", "name email")
            .populate("deliveryBoy", "name email")
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
        
        const total = await Order.countDocuments(query);
        
        res.json({
            success: true,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            orders
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ===============================
// GET ORDER STATS (ADMIN)
// ===============================
exports.getOrderStats = async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({ status: "pending" });
        const deliveredOrders = await Order.countDocuments({ status: "delivered" });
        const cancelledOrders = await Order.countDocuments({ status: "cancelled" });
        
        const totalRevenue = await Order.aggregate([
            { $match: { status: "delivered" } },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ]);
        
        res.json({
            success: true,
            stats: {
                totalOrders,
                pendingOrders,
                deliveredOrders,
                cancelledOrders,
                totalRevenue: totalRevenue[0]?.total || 0
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};