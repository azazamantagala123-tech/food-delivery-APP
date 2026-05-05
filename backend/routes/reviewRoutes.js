const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { addReview, getFoodReviews, getFoodRating } = require("../controllers/reviewController");

router.get("/food/review/:id", getFoodReviews);
router.get("/food/rating/:id", getFoodRating);
router.post("/food/review", authMiddleware, addReview);

module.exports = router;