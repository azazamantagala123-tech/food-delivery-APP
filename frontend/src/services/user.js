// src/services/user.js
import api from './api'  // ✅ Only ONE import at the top

// ==================== PROFILE MANAGEMENT ====================

// Get user profile
export const getProfile = async () => {
  const response = await api.get('/user/profile')
  return response.data
}

// Update user profile
export const updateProfile = async (data) => {
  const response = await api.put('/user/profile', data)
  return response.data
}

// Upload avatar
export const uploadAvatar = async (avatar) => {
  const response = await api.post('/user/avatar', { avatar })
  return response.data
}

// Change password
export const changePassword = async (oldPassword, newPassword) => {
  const response = await api.post('/user/change-password', { oldPassword, newPassword })
  return response.data
}

// Delete account
export const deleteAccount = async () => {
  const response = await api.delete('/user/account')
  return response.data
}

// ==================== ADDRESS MANAGEMENT ====================

// Get all addresses
export const getAddresses = async () => {
  const response = await api.get('/user/address')
  return response.data
}

// Add new address
export const addAddress = async (addressData) => {
  const response = await api.post('/user/address', addressData)
  return response.data
}

// Update address
export const updateAddress = async (id, addressData) => {
  const response = await api.put(`/user/address/${id}`, addressData)
  return response.data
}

// Delete address
export const deleteAddress = async (id) => {
  const response = await api.delete(`/user/address/${id}`)
  return response.data
}

// ==================== WALLET MANAGEMENT ====================

// Get wallet details
export const getWallet = async () => {
  const response = await api.get('/user/wallet')
  return response.data
}

// Add money to wallet
export const addMoney = async (amount) => {
  const response = await api.post('/user/wallet/add', { amount })
  return response.data
}

// Get wallet transaction history
export const getWalletHistory = async () => {
  const response = await api.get('/user/wallet/history')
  return response.data
}

// ==================== NOTIFICATIONS ====================

// Get all notifications
export const getNotifications = async () => {
  const response = await api.get('/user/notifications')
  return response.data
}

// Mark all notifications as read
export const markNotificationsRead = async () => {
  const response = await api.post('/user/notifications/read')
  return response.data
}

// ==================== PREFERENCES ====================

// Get user preferences
export const getPreferences = async () => {
  const response = await api.get('/user/preferences')
  return response.data
}

// Update user preferences
export const updatePreferences = async (preferences) => {
  const response = await api.put('/user/preferences', preferences)
  return response.data
}

// ==================== ORDERS ====================

// Get user orders
export const getUserOrders = async () => {
  const response = await api.get('/user/orders')
  return response.data
}

// ==================== REWARDS & REFERRAL ====================

// Get rewards points
export const getRewards = async () => {
  const response = await api.get('/user/rewards')
  return response.data
}

// Apply referral code
export const applyReferral = async (code) => {
  const response = await api.post('/user/referral', { code })
  return response.data
}

// ==================== SUBSCRIPTION ====================

// Get subscription details
export const getSubscription = async () => {
  const response = await api.get('/user/subscription')
  return response.data
}

// Upgrade subscription plan
export const upgradeSubscription = async (plan) => {
  const response = await api.post('/user/subscription/upgrade', { plan })
  return response.data
}

// ==================== ACTIVITY ====================

// Get user activity
export const getUserActivity = async () => {
  const response = await api.get('/user/activity')
  return response.data
}

// ==================== FEEDBACK ====================

// Submit feedback
export const submitFeedback = async (message, rating) => {
  const response = await api.post('/user/feedback', { message, rating })
  return response.data
}

// ==================== FAVORITES ====================

// Get favorite foods
export const getFavorites = async () => {
  const response = await api.get('/user/favorites')
  return response.data
}

// Add to favorites
export const addFavorite = async (foodId) => {
  const response = await api.post('/user/favorites/add', { foodId })
  return response.data
}

// Remove from favorites
export const removeFavorite = async (foodId) => {
  const response = await api.delete('/user/favorites/remove', { data: { foodId } })
  return response.data
}

// ==================== MEMBERSHIP ====================

// Get membership details
export const getMembership = async () => {
  const response = await api.get('/user/membership')
  return response.data
}

// ==================== SECURITY ====================

// Get login history
export const getLoginHistory = async () => {
  const response = await api.post('/user/login-history')
  return response.data
}

// Get security settings
export const getSecuritySettings = async () => {
  const response = await api.get('/user/security-settings')
  return response.data
}

// ==================== SUPPORT ====================

// Create support ticket
export const createSupportTicket = async (subject, message) => {
  const response = await api.post('/user/support', { subject, message })
  return response.data
}

// Track support ticket
export const trackSupportTicket = async (id) => {
  const response = await api.get(`/user/support/${id}`)
  return response.data
}

// Report issue
export const reportIssue = async (orderId, issue, description) => {
  const response = await api.post('/user/report-issue', { orderId, issue, description })
  return response.data
}

// ==================== PAYMENT METHODS ====================

// Get payment methods
export const getPaymentMethods = async () => {
  const response = await api.get('/user/payment-methods')
  return response.data
}

// Add payment method
export const addPaymentMethod = async (type, details) => {
  const response = await api.post('/user/add-payment-method', { type, details })
  return response.data
}

// Remove payment method
export const removePaymentMethod = async (methodId) => {
  const response = await api.delete('/user/remove-payment-method', { data: { methodId } })
  return response.data
}

// ==================== LOYALTY ====================

// Get loyalty tier
export const getLoyaltyTier = async () => {
  const response = await api.get('/user/loyalty-tier')
  return response.data
}

// ==================== NOTIFICATION SETTINGS ====================

// Update notification settings
export const updateNotificationSettings = async (settings) => {
  const response = await api.post('/user/notification-settings', settings)
  return response.data
}

// ==================== DASHBOARD ====================

// Get dashboard data
export const getDashboard = async () => {
  const response = await api.get('/user/dashboard')
  return response.data
}