// routes/aiRoutes.js
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
    getRecommendations,
    chatbot,
    voiceOrder,
    prediction,
    dietPlan,
    calories,
    imageDetect,
    preferences,
    optimizeCart,
    bestTime,
    dynamicPrice,
    fraudDetect,
    feedback,
    tasteProfile,
    comboBuilder
} = require("../controllers/aiController");

// All AI routes require authentication
router.use(authMiddleware);
router.use(roleMiddleware("user"));

// 15 AI APIs
router.get("/recommend", getRecommendations);
router.post("/chat", chatbot);
router.post("/voice", voiceOrder);
router.get("/prediction", prediction);
router.post("/diet", dietPlan);
router.get("/calories", calories);
router.post("/image-detect", imageDetect);
router.get("/preferences", preferences);
router.post("/optimize-cart", optimizeCart);
router.get("/best-time", bestTime);
router.post("/dynamic-price", dynamicPrice);
router.get("/fraud-detect", fraudDetect);
router.post("/feedback", feedback);
router.get("/taste-profile", tasteProfile);
router.post("/combo-builder", comboBuilder);

module.exports = router;