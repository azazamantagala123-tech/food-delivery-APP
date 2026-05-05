// controllers/paymentController.js
// COMPLETE WORKING CODE - COPY PASTE

const Payment = require("../models/Payment");
const Order = require("../models/Order");
const User = require("../models/User");
const Wallet = require("../models/Wallet");
const Cart = require("../models/Cart");
const crypto = require("crypto");

// Razorpay import (optional - agar keys nahi hain toh fail nahi hoga)
let Razorpay = null;
let razorpayInstance = null;
try {
    Razorpay = require("razorpay");
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
        razorpayInstance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });
        console.log("✅ Razorpay initialized");
    } else {
        console.log("⚠️ Razorpay keys not found. COD and Wallet only.");
    }
} catch (err) {
    console.log("⚠️ Razorpay package not installed. COD and Wallet only.");
}

// ===============================
// 1. INITIATE PAYMENT
// ===============================
exports.initiatePayment = async (req, res) => {
    try {
        const { orderId, method = "razorpay" } = req.body;

        if (!orderId) {
            return res.status(400).json({ success: false, message: "orderId is required" });
        }

        const order = await Order.findOne({
            _id: orderId,
            userId: req.user.id
        });

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        if (order.paymentStatus === "paid") {
            return res.status(400).json({ success: false, message: "Order already paid" });
        }

        // COD Method
        if (method === "cod") {
            const payment = await Payment.create({
                orderId: order._id,
                userId: req.user.id,
                amount: order.totalAmount,
                method: "cod",
                status: "pending",
                transactionId: `COD_${Date.now()}_${order._id}`
            });

            return res.json({
                success: true,
                message: "COD order placed successfully",
                payment: {
                    id: payment._id,
                    method: "cod",
                    amount: payment.amount,
                    status: "pending"
                }
            });
        }

        // Wallet Method
        if (method === "wallet") {
            const wallet = await Wallet.findOne({ userId: req.user.id });
            
            if (!wallet || wallet.balance < order.totalAmount) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Insufficient wallet balance",
                    balance: wallet?.balance || 0,
                    required: order.totalAmount
                });
            }

            wallet.balance -= order.totalAmount;
            wallet.totalWithdrawn += order.totalAmount;
            await wallet.save();

            const payment = await Payment.create({
                orderId: order._id,
                userId: req.user.id,
                amount: order.totalAmount,
                method: "wallet",
                status: "success",
                transactionId: `WALLET_${Date.now()}_${order._id}`,
                paidAt: new Date()
            });

            order.paymentStatus = "paid";
            await order.save();

            return res.json({
                success: true,
                message: "Payment successful via wallet",
                payment: {
                    id: payment._id,
                    method: "wallet",
                    amount: payment.amount,
                    status: "success",
                    balanceRemaining: wallet.balance
                }
            });
        }

        // Razorpay Method
        if (!razorpayInstance) {
            return res.status(400).json({ 
                success: false, 
                message: "Razorpay not configured. Please use COD or Wallet payment." 
            });
        }

        const options = {
            amount: Math.round(order.totalAmount * 100),
            currency: "INR",
            receipt: `receipt_${order._id}`,
            payment_capture: 1,
            notes: {
                orderId: order._id.toString(),
                userId: req.user.id.toString()
            }
        };

        const razorpayOrder = await razorpayInstance.orders.create(options);

        const payment = await Payment.create({
            orderId: order._id,
            userId: req.user.id,
            amount: order.totalAmount,
            method: "razorpay",
            status: "pending",
            razorpayOrderId: razorpayOrder.id,
            transactionId: razorpayOrder.id
        });

        res.json({
            success: true,
            message: "Payment initiated",
            razorpayOrderId: razorpayOrder.id,
            amount: order.totalAmount,
            currency: "INR",
            keyId: process.env.RAZORPAY_KEY_ID,
            paymentId: payment._id
        });

    } catch (error) {
        console.error("Initiate payment error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ===============================
// 2. VERIFY PAYMENT
// ===============================
exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ success: false, message: "Missing payment details" });
        }

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (!isAuthentic) {
            return res.status(400).json({ success: false, message: "Invalid payment signature" });
        }

        const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
        
        if (!payment) {
            return res.status(404).json({ success: false, message: "Payment record not found" });
        }

        payment.status = "success";
        payment.razorpayPaymentId = razorpay_payment_id;
        payment.razorpaySignature = razorpay_signature;
        payment.paidAt = new Date();
        await payment.save();

        const order = await Order.findById(payment.orderId);
        if (order) {
            order.paymentStatus = "paid";
            await order.save();
        }

        res.json({
            success: true,
            message: "Payment verified successfully",
            payment: {
                id: payment._id,
                status: payment.status,
                amount: payment.amount
            }
        });

    } catch (error) {
        console.error("Verify payment error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ===============================
// 3. GET PAYMENT HISTORY
// ===============================
exports.getPaymentHistory = async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        
        const query = { userId: req.user.id };
        if (status) query.status = status;
        
        const payments = await Payment.find(query)
            .populate("orderId", "totalAmount items status")
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
        
        const total = await Payment.countDocuments(query);
        
        res.json({
            success: true,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            payments: payments.map(p => ({
                id: p._id,
                orderId: p.orderId?._id,
                amount: p.amount,
                method: p.method,
                status: p.status,
                transactionId: p.transactionId,
                paidAt: p.paidAt,
                createdAt: p.createdAt
            }))
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ===============================
// 4. GET PAYMENT METHODS
// ===============================
exports.getPaymentMethods = async (req, res) => {
    try {
        const wallet = await Wallet.findOne({ userId: req.user.id });
        
        const methods = [
            {
                id: "cod",
                name: "Cash on Delivery",
                type: "cod",
                icon: "💵",
                isAvailable: true
            },
            {
                id: "wallet",
                name: "Wallet",
                type: "wallet",
                icon: "👛",
                isAvailable: true,
                balance: wallet?.balance || 0
            }
        ];
        
        if (razorpayInstance) {
            methods.push({
                id: "razorpay",
                name: "Card/UPI/Banking",
                type: "razorpay",
                icon: "💳",
                isAvailable: true
            });
        }
        
        res.json({ success: true, methods });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ===============================
// 5. WALLET PAYMENT
// ===============================
exports.walletPayment = async (req, res) => {
    try {
        const { orderId } = req.body;
        
        const order = await Order.findOne({
            _id: orderId,
            userId: req.user.id,
            paymentStatus: "pending"
        });
        
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }
        
        const wallet = await Wallet.findOne({ userId: req.user.id });
        
        if (!wallet || wallet.balance < order.totalAmount) {
            return res.status(400).json({ 
                success: false, 
                message: "Insufficient wallet balance",
                balance: wallet?.balance || 0,
                required: order.totalAmount
            });
        }
        
        wallet.balance -= order.totalAmount;
        wallet.totalWithdrawn += order.totalAmount;
        await wallet.save();
        
        const payment = await Payment.create({
            orderId: order._id,
            userId: req.user.id,
            amount: order.totalAmount,
            method: "wallet",
            status: "success",
            transactionId: `WALLET_${Date.now()}_${order._id}`,
            paidAt: new Date()
        });
        
        order.paymentStatus = "paid";
        await order.save();
        
        await Cart.findOneAndUpdate(
            { userId: req.user.id },
            { items: [], couponCode: null, couponDiscount: 0, tipAmount: 0 }
        );
        
        res.json({
            success: true,
            message: "Payment successful via wallet",
            payment: {
                id: payment._id,
                amount: payment.amount,
                balanceRemaining: wallet.balance
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ===============================
// 6. COD PAYMENT
// ===============================
exports.codPayment = async (req, res) => {
    try {
        const { orderId } = req.body;
        
        const order = await Order.findOne({
            _id: orderId,
            userId: req.user.id,
            paymentStatus: "pending"
        });
        
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }
        
        const payment = await Payment.create({
            orderId: order._id,
            userId: req.user.id,
            amount: order.totalAmount,
            method: "cod",
            status: "pending",
            transactionId: `COD_${Date.now()}_${order._id}`
        });
        
        res.json({
            success: true,
            message: "COD order placed successfully",
            payment: {
                id: payment._id,
                amount: payment.amount,
                status: "pending"
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ===============================
// 7. GET PAYMENT STATUS
// ===============================
exports.getPaymentStatus = async (req, res) => {
    try {
        const { paymentId } = req.params;
        
        const payment = await Payment.findOne({
            _id: paymentId,
            userId: req.user.id
        });
        
        if (!payment) {
            return res.status(404).json({ success: false, message: "Payment not found" });
        }
        
        res.json({
            success: true,
            payment: {
                id: payment._id,
                orderId: payment.orderId,
                amount: payment.amount,
                method: payment.method,
                status: payment.status,
                transactionId: payment.transactionId,
                paidAt: payment.paidAt
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ===============================
// 8. REQUEST REFUND
// ===============================
exports.requestRefund = async (req, res) => {
    try {
        const { paymentId, reason } = req.body;

        const payment = await Payment.findOne({
            _id: paymentId,
            userId: req.user.id,
            status: "success"
        });

        if (!payment) {
            return res.status(404).json({ success: false, message: "Payment not found" });
        }

        if (payment.refundId) {
            return res.status(400).json({ success: false, message: "Refund already processed" });
        }

        let refundStatus = "pending";
        let refundId = null;

        if (payment.method === "wallet") {
            const wallet = await Wallet.findOne({ userId: req.user.id });
            if (wallet) {
                wallet.balance += payment.amount;
                await wallet.save();
                refundId = `WALLET_REFUND_${Date.now()}`;
                refundStatus = "success";
            }
        } else if (payment.method === "cod") {
            refundId = `COD_REFUND_${Date.now()}`;
            refundStatus = "pending";
        } else if (payment.method === "razorpay" && razorpayInstance && payment.razorpayPaymentId) {
            try {
                const refund = await razorpayInstance.payments.refund(payment.razorpayPaymentId, {
                    amount: Math.round(payment.amount * 100)
                });
                refundId = refund.id;
                refundStatus = "success";
            } catch (err) {
                console.error("Razorpay refund error:", err);
                refundStatus = "failed";
            }
        }

        payment.status = refundStatus === "success" ? "refunded" : "partial_refunded";
        payment.refundId = refundId;
        payment.refundAmount = payment.amount;
        payment.refundReason = reason || "Customer requested refund";
        await payment.save();

        res.json({
            success: refundStatus === "success",
            message: refundStatus === "success" ? "Refund processed successfully" : "Refund request submitted",
            refundId,
            amount: payment.amount
        });
    } catch (error) {
        console.error("Refund error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ===============================
// 9. ADD PAYMENT METHOD
// ===============================
exports.addPaymentMethod = async (req, res) => {
    try {
        const { type, details, setAsDefault } = req.body;
        
        const user = await User.findById(req.user.id);
        
        if (!user.paymentMethods) user.paymentMethods = [];
        
        const newMethod = {
            id: Date.now().toString(),
            type,
            details,
            isDefault: setAsDefault || false,
            createdAt: new Date()
        };
        
        if (setAsDefault) {
            user.paymentMethods.forEach(m => m.isDefault = false);
        }
        
        user.paymentMethods.push(newMethod);
        await user.save();
        
        res.json({ success: true, message: "Payment method added", method: newMethod });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ===============================
// 10. REMOVE PAYMENT METHOD
// ===============================
exports.removePaymentMethod = async (req, res) => {
    try {
        const { methodId } = req.params;
        const user = await User.findById(req.user.id);
        user.paymentMethods = user.paymentMethods.filter(m => m.id !== methodId);
        await user.save();
        res.json({ success: true, message: "Payment method removed" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ===============================
// 11. SET DEFAULT PAYMENT METHOD
// ===============================
exports.setDefaultPaymentMethod = async (req, res) => {
    try {
        const { methodId } = req.body;
        const user = await User.findById(req.user.id);
        user.paymentMethods.forEach(m => {
            m.isDefault = m.id === methodId;
        });
        await user.save();
        res.json({ success: true, message: "Default payment method updated" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ===============================
// 12. GET INVOICE
// ===============================
exports.getInvoice = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const payment = await Payment.findOne({ _id: paymentId, userId: req.user.id }).populate("orderId");
        
        if (!payment) {
            return res.status(404).json({ success: false, message: "Payment not found" });
        }
        
        const order = payment.orderId;
        
        res.json({
            success: true,
            invoice: {
                invoiceNumber: `INV-${payment._id.toString().slice(-8).toUpperCase()}`,
                date: payment.paidAt || payment.createdAt,
                orderId: order._id,
                amount: payment.amount,
                method: payment.method,
                status: payment.status
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ===============================
// 13. GET TAX DETAILS
// ===============================
exports.getTaxDetails = async (req, res) => {
    try {
        const { amount } = req.query;
        const baseAmount = parseFloat(amount) || 0;
        const gst = baseAmount * 0.1;
        
        res.json({
            success: true,
            tax: {
                total: gst,
                cgst: gst / 2,
                sgst: gst / 2,
                rate: 10
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ===============================
// 14. SPLIT PAYMENT
// ===============================
exports.splitPayment = async (req, res) => {
    try {
        const { orderId, splits } = req.body;
        
        const order = await Order.findOne({ _id: orderId, userId: req.user.id });
        
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }
        
        let totalPaid = 0;
        const payments = [];
        
        for (const split of splits) {
            if (split.method === "wallet") {
                const wallet = await Wallet.findOne({ userId: req.user.id });
                if (!wallet || wallet.balance < split.amount) {
                    return res.status(400).json({ success: false, message: `Insufficient wallet balance for ₹${split.amount}` });
                }
                wallet.balance -= split.amount;
                await wallet.save();
            }
            
            const payment = await Payment.create({
                orderId: order._id,
                userId: req.user.id,
                amount: split.amount,
                method: split.method,
                status: "success",
                transactionId: `${split.method.toUpperCase()}_${Date.now()}_${order._id}`,
                paidAt: new Date()
            });
            
            payments.push(payment);
            totalPaid += split.amount;
        }
        
        if (totalPaid >= order.totalAmount) {
            order.paymentStatus = "paid";
            await order.save();
        }
        
        res.json({
            success: true,
            message: "Split payment completed",
            payments: payments.map(p => ({ id: p._id, method: p.method, amount: p.amount })),
            totalPaid
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ===============================
// 15. RETRY PAYMENT
// ===============================
exports.retryPayment = async (req, res) => {
    try {
        const { paymentId } = req.params;
        
        const payment = await Payment.findOne({ _id: paymentId, userId: req.user.id, status: "failed" });
        
        if (!payment) {
            return res.status(404).json({ success: false, message: "Failed payment not found" });
        }
        
        if (!razorpayInstance) {
            return res.status(400).json({ success: false, message: "Razorpay not configured" });
        }
        
        const options = {
            amount: Math.round(payment.amount * 100),
            currency: "INR",
            receipt: `retry_${payment._id}`,
            payment_capture: 1
        };
        
        const razorpayOrder = await razorpayInstance.orders.create(options);
        
        payment.razorpayOrderId = razorpayOrder.id;
        payment.status = "pending";
        await payment.save();
        
        res.json({
            success: true,
            message: "Payment retry initiated",
            razorpayOrderId: razorpayOrder.id,
            amount: payment.amount
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};