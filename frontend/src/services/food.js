import api from './api'

// ==================== BASIC CRUD ====================
export const getAllFoods = async () => {
  const response = await api.get('/food/')
  return response.data
}

export const getFoodById = async (id) => {
  const response = await api.get(`/food/${id}`)
  return response.data
}

// ==================== CATEGORY ====================
export const getFoodsByCategory = async (category) => {
  const response = await api.get(`/food/category/${category}`)
  return response.data
}

export const getAllCategories = async () => {
  const response = await api.get('/food/categories/all')
  return response.data
}

// ==================== SEARCH ====================
export const searchFoods = async (query) => {
  const response = await api.get(`/food/search/query?q=${query}`)
  return response.data
}

// ==================== SPECIAL LISTS ====================
export const getPopularFoods = async () => {
  const response = await api.get('/food/list/popular')
  return response.data
}

export const getRecommendedFoods = async () => {
  const response = await api.get('/food/list/recommended')
  return response.data
}

export const getTrendingFoods = async () => {
  const response = await api.get('/food/list/trending')
  return response.data
}

export const getOfferFoods = async () => {
  const response = await api.get('/food/list/offers')
  return response.data
}

export const getComboMeals = async () => {
  const response = await api.get('/food/list/combo')
  return response.data
}

export const getVegFoods = async () => {
  const response = await api.get('/food/list/veg')
  return response.data
}

export const getNonVegFoods = async () => {
  const response = await api.get('/food/list/non-veg')
  return response.data
}

export const getQuickDeliveryFoods = async () => {
  const response = await api.get('/food/list/quick-delivery')
  return response.data
}

export const getPremiumFoods = async () => {
  const response = await api.get('/food/list/premium')
  return response.data
}

export const getChefSpecialFoods = async () => {
  const response = await api.get('/food/list/chef-special')
  return response.data
}

export const getNewArrivals = async () => {
  const response = await api.get('/food/list/new-arrivals')
  return response.data
}

export const getTopRatedFoods = async () => {
  const response = await api.get('/food/list/top-rated')
  return response.data
}

export const getSeasonalFoods = async () => {
  const response = await api.get('/food/list/seasonal')
  return response.data
}

export const getDietFoods = async () => {
  const response = await api.get('/food/list/diet')
  return response.data
}

export const getKetoFoods = async () => {
  const response = await api.get('/food/list/keto')
  return response.data
}

export const getProteinFoods = async () => {
  const response = await api.get('/food/list/protein')
  return response.data
}

export const getKidsMenuFoods = async () => {
  const response = await api.get('/food/list/kids')
  return response.data
}

// ==================== ITEM SPECIFIC ====================
export const customizeItem = async (id) => {
  const response = await api.get(`/food/customize/${id}`)
  return response.data
}

export const getFoodNutrition = async (id) => {
  const response = await api.get(`/food/nutrition/${id}`)
  return response.data
}

export const checkAvailability = async (id) => {
  const response = await api.get(`/food/availability/${id}`)
  return response.data
}

export const getRelatedFoods = async (id) => {
  const response = await api.get(`/food/related/${id}`)
  return response.data
}

export const getFoodTags = async () => {
  const response = await api.get('/food/tags')
  return response.data
}

export const bulkOrder = async (items) => {
  const response = await api.post('/food/bulk', { items })
  return response.data
}

// ==================== REVIEWS & RATINGS ====================
export const getFoodReviews = async (id) => {
  const response = await api.get(`/food/review/${id}`)
  return response.data
}

export const getFoodRating = async (id) => {
  const response = await api.get(`/food/rating/${id}`)
  return response.data
}

export const addReview = async (foodId, orderId, rating, comment) => {
  const response = await api.post('/food/review', { foodId, orderId, rating, comment })
  return response.data
}