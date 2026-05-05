// routes/foodRoutes.js
// COMPLETE FOOD ROUTES - CORRECT ORDER

const express = require("express");
const router = express.Router();

const {
    getAllFoods,
    getFoodById,
    getFoodsByCategory,
    searchFood,
    getPopularFoods,
    getRecommendedFoods,
    getTrendingFoods,
    getOfferFoods,
    getComboMeals,
    getVegItems,
    getNonVegItems,
    getQuickDelivery,
    getPremiumFoods,
    getChefSpecial,
    getNewArrivals,
    getTopRated,
    getRelatedFoods,
    getSeasonalItems,
    getDietFoods,
    getKetoFoods,
    getProteinFoods,
    getKidsMenu,
    customizeItem,
    getNutritionInfo,
    checkAvailability,
    getFoodTags,
    bulkOrderMenu,
    getAllCategories
} = require("../controllers/foodController");

// ==================== SPECIFIC ROUTES (NO :id PARAM) ====================
router.get("/tags", getFoodTags);
router.get("/categories/all", getAllCategories);
router.get("/search/query", searchFood);

// ==================== LIST ROUTES ====================
router.get("/list/popular", getPopularFoods);
router.get("/list/recommended", getRecommendedFoods);
router.get("/list/trending", getTrendingFoods);
router.get("/list/offers", getOfferFoods);
router.get("/list/combo", getComboMeals);
router.get("/list/veg", getVegItems);
router.get("/list/non-veg", getNonVegItems);
router.get("/list/quick-delivery", getQuickDelivery);
router.get("/list/premium", getPremiumFoods);
router.get("/list/chef-special", getChefSpecial);
router.get("/list/new-arrivals", getNewArrivals);
router.get("/list/top-rated", getTopRated);
router.get("/list/seasonal", getSeasonalItems);
router.get("/list/diet", getDietFoods);
router.get("/list/keto", getKetoFoods);
router.get("/list/protein", getProteinFoods);
router.get("/list/kids", getKidsMenu);

// ==================== ROUTES WITH :id PARAM (Specific paths first) ====================
router.get("/customize/:id", customizeItem);
router.get("/nutrition/:id", getNutritionInfo);
router.get("/availability/:id", checkAvailability);
router.get("/related/:id", getRelatedFoods);
router.get("/category/:category", getFoodsByCategory);
router.post("/bulk", bulkOrderMenu);

// ==================== GENERAL ROUTES (MUST BE LAST) ====================
router.get("/", getAllFoods);
router.get("/:id", getFoodById);

module.exports = router;