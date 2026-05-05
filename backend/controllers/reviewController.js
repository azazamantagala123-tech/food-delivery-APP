const Review = require("../models/Review");
const Order = require("../models/Order");
const Food = require("../models/Food");

exports.addReview = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const { foodId, orderId, rating, comment } = req.body;

        if (!foodId || !orderId || !rating || !comment) {
            return res.status(400).json({ 
                success: false, 
                message: "foodId, orderId, rating and comment are required" 
            });
        }

        const order = await Order.findOne({ 
            _id: orderId, 
            userId: userId,
            status: "delivered" 
        });

        if (!order) {
            return res.status(400).json({ 
                success: false, 
                message: "Can only review delivered orders that belong to you" 
            });
        }

        const existingReview = await Review.findOne({
            user: userId,
            food: foodId,
            order: orderId
        });

        if (existingReview) {
            return res.status(400).json({ 
                success: false, 
                message: "You already reviewed this item" 
            });
        }

        const review = await Review.create({
            user: userId,
            food: foodId,
            order: orderId,
            rating: Number(rating),
            comment: comment.trim(),
            isHidden: false,
            isVerified: true
        });

        // ✅ Update food with correct field names
        const allReviews = await Review.find({ food: foodId, isHidden: false });
        const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
        const averageRating = allReviews.length > 0 ? totalRating / allReviews.length : 0;
        
        await Food.findByIdAndUpdate(foodId, {
            rating: Number(averageRating.toFixed(1)),      // ← "rating"
            totalRatings: allReviews.length                // ← "totalRatings"
        });

        res.status(201).json({
            success: true,
            message: "Review added successfully",
            review: {
                id: review._id,
                rating: review.rating,
                comment: review.comment,
                createdAt: review.createdAt
            }
        });

    } catch (error) {
        console.error("Review Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getFoodReviews = async (req, res) => {
    try {
        const { id } = req.params;
        
        const reviews = await Review.find({ food: id, isHidden: false })
            .populate("user", "name")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: reviews.length,
            reviews
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getFoodRating = async (req, res) => {
    try {
        const { id } = req.params;
        
        // ✅ Use sahi field names
        const food = await Food.findById(id).select("rating totalRatings name");
        
        if (!food) {
            return res.status(404).json({ success: false, message: "Food not found" });
        }

        res.json({
            success: true,
            foodId: id,
            name: food.name,
            averageRating: food.rating || 0,        // ← "rating"
            totalReviews: food.totalRatings || 0    // ← "totalRatings"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};