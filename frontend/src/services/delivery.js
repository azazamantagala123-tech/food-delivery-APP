import api from './api'

export const getAssignedOrders = async () => {
  const response = await api.get('/delivery/orders')
  return response.data
}

export const getOrderDetail = async (id) => {
  const response = await api.get(`/delivery/order/${id}`)
  return response.data
}

export const updateOrderStatus = async (orderId, status, remarks = '') => {
  const response = await api.post('/delivery/update-status', { orderId, status, remarks })
  return response.data
}

export const acceptDelivery = async (orderId) => {
  const response = await api.post('/delivery/accept', { orderId })
  return response.data
}

export const rejectDelivery = async (orderId, reason) => {
  const response = await api.post('/delivery/reject', { orderId, reason })
  return response.data
}

export const confirmPickup = async (orderId, otp = '') => {
  const response = await api.post('/delivery/pickup', { orderId, otp })
  return response.data
}

export const confirmDrop = async (orderId, otp = '') => {
  const response = await api.post('/delivery/drop', { orderId, otp })
  return response.data
}

export const updateLocation = async (latitude, longitude, orderId = null) => {
  const response = await api.post('/delivery/location', { latitude, longitude, orderId })
  return response.data
}

export const getWallet = async () => {
  const response = await api.get('/delivery/wallet')
  return response.data
}

export const withdrawEarnings = async (amount) => {
  const response = await api.post('/delivery/withdraw', { amount })
  return response.data
}

export const getEarnings = async (period = 'weekly') => {
  const response = await api.get(`/delivery/earnings?period=${period}`)
  return response.data
}

export const getRatings = async () => {
  const response = await api.get('/delivery/ratings')
  return response.data
}

export const raiseSupport = async (subject, message, orderId = null) => {
  const response = await api.post('/delivery/support', { subject, message, orderId })
  return response.data
}

export const goOnline = async () => {
  const response = await api.post('/delivery/online')
  return response.data
}

export const goOffline = async () => {
  const response = await api.post('/delivery/offline')
  return response.data
}

export const getAvailability = async () => {
  const response = await api.get('/delivery/availability')
  return response.data
}

export const getShift = async () => {
  const response = await api.get('/delivery/shift')
  return response.data
}

export const setBreak = async (action) => {
  const response = await api.post('/delivery/break', { action })
  return response.data
}

export const getDeliveryHistory = async (page = 1, limit = 10) => {
  const response = await api.get(`/delivery/history?page=${page}&limit=${limit}`)
  return response.data
}