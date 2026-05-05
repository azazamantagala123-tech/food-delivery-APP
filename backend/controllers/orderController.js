// controllers/orderController.js
// COMPLETE 25 APIs - COPY PASTE

const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Payment = require("../models/Payment");
const Wallet = require("../models/Wallet");
const User = require("../models/User");
const Food = require("../models/Food");
const SupportTicket = require("../models/SupportTicket");
const Refund = require("../models/Refund");


function generateOrderId() {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ORD${year}${month}${random}`;
}
// ===============================
// HELPER FUNCTIONS
// ===============================
function generateOrderId() {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ORD${year}${month}${random}`;
}

function addToHistory(order, status, userId, remarks) {
    order.statusHistory.push({
        status,
        timestamp: new Date(),
        updatedBy: userId,
        remarks
    });
}

// ===============================
// 1. CREATE ORDER
// ===============================
exports.createOrder = async (req, res) => {
    try {
        console.log("=== CREATE ORDER START ===");
        console.log("User:", req.user?.id);
        console.log("Body:", JSON.stringify(req.body, null, 2));
        
        const userId = req.user.id;
        const { items, totalAmount, address, deliveryLocation, paymentMethod, scheduleFor, instructions } = req.body;

        if (!items || items.length === 0) {
            console.log("Error: Cart is empty");
            return res.status(400).json({ success: false, message: "Cart is empty" });
        }

        if (!address) {
            console.log("Error: Address is required");
            return res.status(400).json({ success: false, message: "Address is required" });
        }

        let deliveryFee = 40;
        let tax = (totalAmount - (totalAmount * 0.1)) * 0.05;
        let finalAmount = totalAmount + deliveryFee + tax;
        
        console.log("Calculations:", { totalAmount, deliveryFee, tax, finalAmount });

        const order = await Order.create({
            orderId: generateOrderId(),
            userId,
            items,
            totalAmount,
            discount: 0,
            deliveryFee,
            tax,
            finalAmount,
            address,
            deliveryLocation: deliveryLocation || { lat: 26.9124, lng: 75.7873, address },
            paymentMethod: paymentMethod || "cod",
            scheduleFor: scheduleFor || null,
            instructions: instructions || "",
            status: "pending",
            statusHistory: [{ status: "pending", timestamp: new Date(), updatedBy: userId }]
        });

        console.log("Order created:", order._id);

        // Clear cart after order
        await Cart.findOneAndUpdate({ userId }, { items: [], couponCode: null, couponDiscount: 0 });

        res.status(201).json({
            success: true,
            message: "Order created successfully",
            order: { id: order._id, orderId: order.orderId, status: order.status, finalAmount: order.finalAmount, createdAt: order.createdAt }
        });
    } catch (error) {
        console.error("=== CREATE ORDER ERROR ===");
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
        res.status(500).json({ success: false, message: error.message, stack: error.stack });
    }
};

// ===============================
// 2. GET ORDER BY ID
// ===============================
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate("userId", "name email phone").populate("deliveryBoy", "name email phone");
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });
        if (order.userId._id.toString() !== req.user.id && order.deliveryBoy?._id?.toString() !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Access denied" });
        }
        res.json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ===============================
// 3. GET USER ORDERS
// ===============================
exports.getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json({ success: true, count: orders.length, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ===============================
// 4. CANCEL ORDER
// ===============================
exports.cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.body;
        const order = await Order.findOne({ _id: orderId, userId: req.user.id });
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });
        if (!["pending", "confirmed"].includes(order.status)) {
            return res.status(400).json({ success: false, message: `Cannot cancel order with status: ${order.status}` });
        }
        order.status = "cancelled";
        order.cancelledAt = new Date();
        addToHistory(order, "cancelled", req.user.id, "User cancelled order");
        await order.save();
        res.json({ success: true, message: "Order cancelled successfully", order: { id: order._id, status: order.status } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ===============================
// 5. REORDER (Create new order from previous)
// ===============================
exports.reorder = async (req, res) => {
    try {
        const { orderId } = req.body;
        const previousOrder = await Order.findOne({ _id: orderId, userId: req.user.id });
        if (!previousOrder) return res.status(404).json({ success: false, message: "Order not found" });
        const newOrder = await Order.create({
            orderId: generateOrderId(),
            userId: req.user.id,
            items: previousOrder.items.map(item => ({ ...item, _id: undefined })),
            totalAmount: previousOrder.totalAmount,
            address: previousOrder.address,
            deliveryLocation: previousOrder.deliveryLocation,
            paymentMethod: previousOrder.paymentMethod,
            finalAmount: previousOrder.finalAmount,
            status: "pending",
            statusHistory: [{ status: "pending", timestamp: new Date(), updatedBy: req.user.id }]
        });
        res.status(201).json({ success: true, message: "Reorder placed successfully", order: { id: newOrder._id, orderId: newOrder.orderId } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ===============================
// 6. RATE ORDER
// ===============================
exports.rateOrder = async (req, res) => {
    try {
        const { orderId, rating, review } = req.body;
        const order = await Order.findOne({ _id: orderId, userId: req.user.id, status: "delivered" });
        if (!order) return res.status(404).json({ success: false, message: "Order not found or not delivered" });
        order.rating = rating;
        order.review = review || "";
        await order.save();
        res.json({ success: true, message: "Order rated successfully", rating, review });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ===============================
// 7. GET ORDER STATUS
// ===============================
exports.getOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findById(id).select("status statusHistory estimatedDelivery");
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });
        res.json({ success: true, status: order.status, history: order.statusHistory });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ===============================
// 8. SCHEDULE ORDER
// ===============================
exports.scheduleOrder = async (req, res) => {
    try {
        const { orderId, scheduleFor } = req.body;
        const order = await Order.findOne({ _id: orderId, userId: req.user.id, status: "pending" });
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });
        order.scheduleFor = new Date(scheduleFor);
        await order.save();
        res.json({ success: true, message: "Order scheduled", scheduleFor: order.scheduleFor });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ===============================
// 9. ORDER HISTORY (with filters)
// ===============================
exports.getOrderHistory = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, from, to } = req.query;
        let query = { userId: req.user.id };
        if (status) query.status = status;
        if (from || to) {
            query.createdAt = {};
            if (from) query.createdAt.$gte = new Date(from);
            if (to) query.createdAt.$lte = new Date(to);
        }
        const orders = await Order.find(query).sort({ createdAt: -1 }).limit(limit * 1).skip((page - 1) * limit);
        const total = await Order.countDocuments(query);
        res.json({ success: true, total, totalPages: Math.ceil(total / limit), currentPage: parseInt(page), orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ===============================
// 10. SPLIT ORDER
// ===============================
exports.splitOrder = async (req, res) => {
    try {
        const { orderId, splits } = req.body;
        const originalOrder = await Order.findOne({ _id: orderId, userId: req.user.id });
        if (!originalOrder) return res.status(404).json({ success: false, message: "Order not found" });
        const splitOrders = [];
        for (const split of splits) {
            const splitItems = originalOrder.items.filter(item => split.itemIds.includes(item.foodId.toString()));
            if (splitItems.length === 0) continue;
            const splitAmount = splitItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const newOrder = await Order.create({
                orderId: generateOrderId(),
                userId: req.user.id,
                items: splitItems,
                totalAmount: splitAmount,
                address: split.address || originalOrder.address,
                paymentMethod: split.paymentMethod || originalOrder.paymentMethod,
                finalAmount: splitAmount,
                status: "pending",
                statusHistory: [{ status: "pending", timestamp: new Date(), updatedBy: req.user.id }]
            });
            splitOrders.push(newOrder);
        }
        originalOrder.status = "cancelled";
        await originalOrder.save();
        res.json({ success: true, message: "Order split successfully", orders: splitOrders.map(o => ({ id: o._id, orderId: o.orderId })) });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ===============================
// 11. MERGE ORDERS
// ===============================
exports.mergeOrders = async (req, res) => {
    try {
        const { orderIds } = req.body;
        
        console.log("Merge request - Order IDs:", orderIds);
        
        if (!orderIds || !Array.isArray(orderIds) || orderIds.length < 2) {
            return res.status(400).json({ 
                success: false, 
                message: "Need at least 2 orders to merge" 
            });
        }
        
        // Find all pending orders
        const orders = await Order.find({ 
            _id: { $in: orderIds }, 
            userId: req.user.id, 
            status: "pending" 
        });
        
        console.log("Found orders:", orders.length);
        
        if (orders.length < 2) {
            return res.status(400).json({ 
                success: false, 
                message: `Only ${orders.length} pending orders found. Need at least 2.` 
            });
        }
        
        let allItems = [];
        let totalAmount = 0;
        let paymentMethod = orders[0].paymentMethod;
        let address = orders[0].address;
        let deliveryLocation = orders[0].deliveryLocation;
        
        // Merge all items and total amount
        for (const order of orders) {
            allItems.push(...order.items);
            totalAmount += order.totalAmount;
        }
        
        // Calculate final amount
        const deliveryFee = 40;
        const tax = totalAmount * 0.05;
        const finalAmount = totalAmount + deliveryFee + tax;
        
        // Create merged order
        const mergedOrder = await Order.create({
            orderId: generateOrderId(),
            userId: req.user.id,
            items: allItems,
            totalAmount: totalAmount,
            discount: 0,
            deliveryFee: deliveryFee,
            tax: tax,
            finalAmount: finalAmount,
            address: address,
            deliveryLocation: deliveryLocation,
            paymentMethod: paymentMethod,
            paymentStatus: "pending",
            status: "pending",
            statusHistory: [{ 
                status: "pending", 
                timestamp: new Date(), 
                updatedBy: req.user.id,
                remarks: "Orders merged"
            }]
        });
        
        // Cancel original orders
        for (const order of orders) {
            order.status = "cancelled";
            order.cancelledAt = new Date();
            order.statusHistory.push({
                status: "cancelled",
                timestamp: new Date(),
                updatedBy: req.user.id,
                remarks: "Merged into new order"
            });
            await order.save();
        }
        
        res.json({ 
            success: true, 
            message: "Orders merged successfully", 
            mergedOrder: { 
                id: mergedOrder._id, 
                orderId: mergedOrder.orderId,
                finalAmount: mergedOrder.finalAmount,
                itemCount: mergedOrder.items.length
            } 
        });
        
    } catch (error) {
        console.error("Merge orders error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};


// ===============================
// 12. GENERATE INVOICE
// ===============================
exports.generateInvoice = async (req, res) => {
    try {
        const { orderId } = req.body;
        const order = await Order.findOne({ _id: orderId, userId: req.user.id }).populate("userId", "name email phone");
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });
        const invoice = {
            invoiceNo: `INV-${order.orderId}`,
            date: order.deliveredAt || order.createdAt,
            orderId: order.orderId,
            customer: { name: order.userId.name, email: order.userId.email, phone: order.userId.phone },
            items: order.items,
            subtotal: order.totalAmount,
            discount: order.discount,
            deliveryFee: order.deliveryFee,
            tax: order.tax,
            total: order.finalAmount,
            paymentMethod: order.paymentMethod,
            paymentStatus: order.paymentStatus
        };
        res.json({ success: true, invoice });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ===============================
// 13. GET INVOICE BY ID
// ===============================
exports.getInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findById(id).populate("userId", "name email phone");
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });
        const invoice = {
            invoiceNo: `INV-${order.orderId}`,
            date: order.deliveredAt || order.createdAt,
            orderId: order.orderId,
            items: order.items,
            subtotal: order.totalAmount,
            discount: order.discount,
            deliveryFee: order.deliveryFee,
            tax: order.tax,
            total: order.finalAmount
        };
        res.json({ success: true, invoice });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ===============================
// 14. ORDER SUPPORT REQUEST
// ===============================
exports.orderSupport = async (req, res) => {
    try {
        const { orderId, subject, message } = req.body;
        const order = await Order.findOne({ _id: orderId, userId: req.user.id });
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });
        const ticket = await SupportTicket.create({
            deliveryBoy: order.deliveryBoy,
            subject: `Order ${order.orderId}: ${subject}`,
            message,
            status: "open"
        });
        order.supportTicket = ticket._id;
        await order.save();
        res.json({ success: true, message: "Support ticket created", ticketId: ticket._id });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ===============================
// 15. GET SUPPORT STATUS
// ===============================
exports.getSupportStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const ticket = await SupportTicket.findById(id);
        if (!ticket) return res.status(404).json({ success: false, message: "Ticket not found" });
        res.json({ success: true, status: ticket.status, ticket });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ===============================
// 16. REPORT ISSUE
// ===============================
exports.reportIssue = async (req, res) => {
    try {
        const { orderId, issue, description } = req.body;
        const order = await Order.findOne({ _id: orderId, userId: req.user.id });
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });
        order.issueReported = true;
        order.issueDescription = description;
        await order.save();
        res.json({ success: true, message: "Issue reported successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ===============================
// 17. REQUEST REFUND
// ===============================
exports.requestRefund = async (req, res) => {
    try {
        const { orderId, reason } = req.body;
        const order = await Order.findOne({ _id: orderId, userId: req.user.id, status: "delivered" });
        if (!order) return res.status(404).json({ success: false, message: "Order not found or not delivered" });
        const refund = await Refund.create({
            order: order._id,
            user: req.user.id,
            amount: order.finalAmount,
            reason,
            status: "pending"
        });
        order.refundRequested = true;
        order.refundAmount = order.finalAmount;
        order.refundStatus = "pending";
        order.refundReason = reason;
        await order.save();
        res.json({ success: true, message: "Refund request submitted", refundId: refund._id });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ===============================
// 18. GET REFUND STATUS
// ===============================
exports.getRefundStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const refund = await Refund.findOne({ _id: id, user: req.user.id });
        if (!refund) return res.status(404).json({ success: false, message: "Refund not found" });
        res.json({ success: true, status: refund.status, refund });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ===============================
// 19. PRIORITY ORDER
// ===============================
exports.priorityOrder = async (req, res) => {
    try {
        const { orderId } = req.body;
        const order = await Order.findOne({ _id: orderId, userId: req.user.id });
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });
        const priorityFee = 50;
        if (order.paymentMethod === "wallet") {
            const wallet = await Wallet.findOne({ userId: req.user.id });
            if (!wallet || wallet.balance < priorityFee) {
                return res.status(400).json({ success: false, message: "Insufficient balance for priority fee" });
            }
            wallet.balance -= priorityFee;
            await wallet.save();
        }
        order.priority = true;
        order.finalAmount += priorityFee;
        await order.save();
        res.json({ success: true, message: "Order upgraded to priority", priorityFee });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ===============================
// 20. GET ESTIMATED TIME
// ===============================
exports.getEstimatedTime = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findById(id);
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });
        let estimatedTime = 30;
        if (order.priority) estimatedTime = 20;
        if (order.status === "preparing") estimatedTime = 25;
        else if (order.status === "out_for_delivery") estimatedTime = 15;
        else if (order.status === "picked_up") estimatedTime = 10;
        res.json({ success: true, estimatedTime, unit: "minutes", minTime: estimatedTime - 5, maxTime: estimatedTime + 5 });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ===============================
// 21. ADD INSTRUCTIONS
// ===============================
exports.addInstructions = async (req, res) => {
    try {
        const { orderId, instructions } = req.body;
        const order = await Order.findOne({ _id: orderId, userId: req.user.id });
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });
        order.instructions = instructions;
        await order.save();
        res.json({ success: true, message: "Instructions added", instructions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ===============================
// 22. GET ORDER TIMELINE
// ===============================
exports.getOrderTimeline = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findById(id);
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });
        const timeline = [];
        if (order.createdAt) timeline.push({ event: "Order Placed", time: order.createdAt });
        if (order.confirmedAt) timeline.push({ event: "Order Confirmed", time: order.confirmedAt });
        if (order.preparingAt) timeline.push({ event: "Preparing", time: order.preparingAt });
        if (order.readyAt) timeline.push({ event: "Ready for Pickup", time: order.readyAt });
        if (order.assignedAt) timeline.push({ event: "Delivery Boy Assigned", time: order.assignedAt });
        if (order.acceptedAt) timeline.push({ event: "Delivery Boy Accepted", time: order.acceptedAt });
        if (order.pickedUpAt) timeline.push({ event: "Picked Up", time: order.pickedUpAt });
        if (order.deliveredAt) timeline.push({ event: "Delivered", time: order.deliveredAt });
        res.json({ success: true, timeline });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ===============================
// 23. RESCHEDULE ORDER
// ===============================
exports.rescheduleOrder = async (req, res) => {
    try {
        const { orderId, newScheduleTime } = req.body;
        const order = await Order.findOne({ _id: orderId, userId: req.user.id, status: "pending" });
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });
        order.scheduleFor = new Date(newScheduleTime);
        order.rescheduledAt = new Date();
        await order.save();
        res.json({ success: true, message: "Order rescheduled", newScheduleTime: order.scheduleFor });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ===============================
// 24. LIVE STATUS (WebSocket ready)
// ===============================
exports.getLiveStatus = async (req, res) => {
    try {
        const { orderId } = req.query;
        if (!orderId) {
            const orders = await Order.find({ userId: req.user.id, status: { $nin: ["delivered", "cancelled"] } });
            return res.json({ success: true, liveOrders: orders.map(o => ({ id: o._id, status: o.status, updatedAt: o.updatedAt })) });
        }
        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });
        res.json({ success: true, status: order.status, lastUpdated: order.updatedAt });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ===============================
// 25. CONFIRM DELIVERY (User)
// ===============================
exports.confirmDelivery = async (req, res) => {
    try {
        const { orderId } = req.body;
        const order = await Order.findOne({ _id: orderId, userId: req.user.id, status: "out_for_delivery" });
        if (!order) return res.status(404).json({ success: false, message: "Order not found or not out for delivery" });
        order.status = "delivered";
        order.deliveredAt = new Date();
        addToHistory(order, "delivered", req.user.id, "User confirmed delivery");
        await order.save();
        res.json({ success: true, message: "Delivery confirmed", orderId: order._id });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};