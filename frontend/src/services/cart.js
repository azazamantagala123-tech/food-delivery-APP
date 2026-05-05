// src/services/cart.js
import api from './api'

// ==================== CART CRUD ====================
export const getCart = async () => {
  const response = await api.get('/cart/')
  return response.data
}

export const addToCart = async (foodId, quantity, specialInstructions = '') => {
  const response = await api.post('/cart/add', { foodId, quantity, specialInstructions })
  return response.data
}

export const updateQuantity = async (foodId, quantity) => {
  const response = await api.put('/cart/update', { foodId, quantity })
  return response.data
}

export const removeFromCart = async (foodId) => {
  const response = await api.delete(`/cart/remove/${foodId}`)
  return response.data
}

export const clearCart = async () => {
  const response = await api.delete('/cart/clear')
  return response.data
}

// ==================== COUPON ====================
export const applyCoupon = async (couponCode) => {
  const response = await api.post('/cart/apply-coupon', { couponCode })
  return response.data
}

export const removeCoupon = async () => {
  const response = await api.delete('/cart/remove-coupon')
  return response.data
}

// ==================== CART SUMMARY ====================
// ✅ Keep only ONE getCartSummary function
export const getCartSummary = async () => {
  const response = await api.get('/cart/summary')
  return response.data
}

// ==================== TIP ====================
export const addTip = async (tipAmount) => {
  const response = await api.post('/cart/tip', { tipAmount })
  return response.data
}

// ==================== SAVE & RESTORE ====================
export const saveCart = async () => {
  const response = await api.post('/cart/save', {})
  return response.data
}

export const restoreCart = async (savedCartId) => {
  const response = await api.post('/cart/restore', { savedCartId })
  return response.data
}

// ==================== GIFT CART ====================
export const giftCart = async (email, message) => {
  const response = await api.post('/cart/gift', { email, message })
  return response.data
}

// ==================== CALCULATIONS ====================
export const calculateTax = async () => {
  const response = await api.get('/cart/tax')
  return response.data
}

export const getDeliveryFee = async (distance = null) => {
  const url = distance ? `/cart/delivery-fee?distance=${distance}` : '/cart/delivery-fee'
  const response = await api.get(url)
  return response.data
}

export const estimateTime = async () => {
  const response = await api.get('/cart/estimate-time')
  return response.data
}