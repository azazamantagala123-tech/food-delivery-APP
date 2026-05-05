import api from './api'

// ==================== DASHBOARD & STATS ====================
export const getAdminStats = async () => {
  const response = await api.get('/admin/stats')
  return response.data
}

export const getAnalytics = async (period = 'week') => {
  const response = await api.get(`/admin/analytics?period=${period}`)
  return response.data
}

export const getRevenue = async (type = 'daily') => {
  const response = await api.get(`/admin/revenue?type=${type}`)
  return response.data
}

// ==================== FOODS ====================
export const getAdminFoods = async () => {
  const response = await api.get('/admin/foods')
  return response.data
}

export const createFood = async (data) => {
  const response = await api.post('/admin/food', data)
  return response.data
}

export const updateFood = async (id, data) => {
  const response = await api.put(`/admin/food/${id}`, data)
  return response.data
}

export const deleteFood = async (id) => {
  const response = await api.delete(`/admin/food/${id}`)
  return response.data
}

// ==================== ORDERS ====================
export const getAdminOrders = async () => {
  const response = await api.get('/admin/orders')
  return response.data
}

export const updateOrderStatus = async (orderId, status, remarks = '') => {
  const response = await api.put('/admin/order-status', { orderId, status, remarks })
  return response.data
}

// ==================== USERS ====================
export const getAdminUsers = async (params = {}) => {
  const query = new URLSearchParams(params).toString()
  const response = await api.get(`/admin/users${query ? `?${query}` : ''}`)
  return response.data
}

export const getUserDetails = async (userId) => {
  const response = await api.get(`/admin/user/${userId}`)
  return response.data
}

export const blockUser = async (userId, reason = '') => {
  const response = await api.delete(`/admin/user/${userId}`, { data: { reason } })
  return response.data
}

// ==================== DELIVERY BOYS ====================
export const getDeliveryBoys = async () => {
  const response = await api.get('/admin/deliveries')
  return response.data
}

export const getDeliveryBoyDetails = async (id) => {
  const response = await api.get(`/admin/delivery-details/${id}`)
  return response.data
}

export const createDeliveryBoy = async (data) => {
  const response = await api.post('/admin/create-delivery', data)
  return response.data
}

export const updateDeliveryBoy = async (id, data) => {
  const response = await api.put(`/admin/update-delivery/${id}`, data)
  return response.data
}

export const deleteDeliveryBoy = async (id) => {
  const response = await api.delete(`/admin/delete-delivery/${id}`)
  return response.data
}

export const assignDeliveryBoy = async (orderId, deliveryBoyId) => {
  const response = await api.post('/admin/assign-order', { orderId, deliveryBoyId })
  return response.data
}

// ==================== KYC MANAGEMENT ====================
export const getPendingKYC = async () => {
  const response = await api.get('/admin/kyc/pending')
  return response.data
}

export const getAllKYCRequests = async () => {
  const response = await api.get('/admin/kyc/all')
  return response.data
}

export const approveKYC = async (deliveryBoyId) => {
  const response = await api.post('/admin/kyc/approve', { deliveryBoyId })
  return response.data
}

export const rejectKYC = async (deliveryBoyId, reason) => {
  const response = await api.post('/admin/kyc/reject', { deliveryBoyId, reason })
  return response.data
}

// ==================== COUPONS ====================
export const getCoupons = async () => {
  const response = await api.get('/admin/coupons')
  return response.data
}

export const getCouponById = async (id) => {
  const response = await api.get(`/admin/coupon/${id}`)
  return response.data
}

export const createCoupon = async (data) => {
  const response = await api.post('/admin/coupon', data)
  return response.data
}

export const updateCoupon = async (id, data) => {
  const response = await api.put(`/admin/coupon/${id}`, data)
  return response.data
}

export const deleteCoupon = async (id) => {
  const response = await api.delete(`/admin/coupon/${id}`)
  return response.data
}

export const toggleCoupon = async (id) => {
  const response = await api.patch(`/admin/coupon/${id}/toggle`)
  return response.data
}

// ==================== CATEGORIES ====================
export const getCategories = async () => {
  const response = await api.get('/admin/categories')
  return response.data
}

export const createCategory = async (data) => {
  const response = await api.post('/admin/category', data)
  return response.data
}

export const updateCategory = async (id, data) => {
  const response = await api.put(`/admin/category/${id}`, data)
  return response.data
}

export const deleteCategory = async (id) => {
  const response = await api.delete(`/admin/category/${id}`)
  return response.data
}

// ==================== OFFERS ====================
export const getOffers = async () => {
  const response = await api.get('/admin/offers')
  return response.data
}

export const createOffer = async (data) => {
  const response = await api.post('/admin/offer', data)
  return response.data
}

export const deleteOffer = async (id) => {
  const response = await api.delete(`/admin/offer/${id}`)
  return response.data
}

// ==================== REPORTS ====================
export const getReports = async (data) => {
  const response = await api.post('/admin/reports', data)
  return response.data
}

// ==================== SETTINGS ====================
export const getSettings = async (publicOnly = false) => {
  const response = await api.get(`/admin/settings${publicOnly ? '?public=true' : ''}`)
  return response.data
}

export const updateSettings = async (data) => {
  const response = await api.post('/admin/settings', data)
  return response.data
}

export const getSystemHealth = async () => {
  const response = await api.get('/admin/system-health')
  return response.data
}

export const toggleFeature = async (feature, enabled) => {
  const response = await api.post('/admin/feature-toggle', { feature, enabled })
  return response.data
}

// ==================== LIVE ORDERS ====================
export const getLiveOrders = async () => {
  const response = await api.get('/admin/live-orders')
  return response.data
}

// ==================== REVIEWS ====================
export const getAllReviews = async (params = {}) => {
  const query = new URLSearchParams(params).toString()
  const response = await api.get(`/admin/reviews${query ? `?${query}` : ''}`)
  return response.data
}

export const deleteReview = async (id) => {
  const response = await api.delete(`/admin/review/${id}`)
  return response.data
}

// ==================== COMPLAINTS ====================
export const getAllComplaints = async () => {
  const response = await api.get('/admin/complaints')
  return response.data
}

// ==================== REFUNDS ====================
export const approveRefund = async (refundId, remarks = '') => {
  const response = await api.post('/admin/refund-approve', { refundId, remarks })
  return response.data
}

export const rejectRefund = async (refundId, remarks = '') => {
  const response = await api.post('/admin/refund-reject', { refundId, remarks })
  return response.data
}

// ==================== FRAUD & LOGS ====================
export const getFraudLogs = async () => {
  const response = await api.get('/admin/fraud')
  return response.data
}

export const getSystemLogs = async (params = {}) => {
  const query = new URLSearchParams(params).toString()
  const response = await api.get(`/admin/logs${query ? `?${query}` : ''}`)
  return response.data
}

// ==================== NOTIFICATIONS ====================
export const sendNotification = async (data) => {
  const response = await api.post('/admin/notification', data)
  return response.data
}

export const sendPushNotification = async (data) => {
  const response = await api.post('/admin/push-notification', data)
  return response.data
}