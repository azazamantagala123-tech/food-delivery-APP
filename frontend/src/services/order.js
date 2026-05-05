import api from './api'

export const createOrder = async (orderData) => {
  const response = await api.post('/order/create', orderData)
  return response.data
}

export const getUserOrders = async () => {
  const response = await api.get('/order/my-orders')
  return response.data
}

export const getOrderById = async (id) => {
  const response = await api.get(`/order/${id}`)
  return response.data
}

export const cancelOrder = async (orderId) => {
  const response = await api.post('/order/cancel', { orderId })
  return response.data
}

export const reorder = async (orderId) => {
  const response = await api.post('/order/reorder', { orderId })
  return response.data
}

export const rateOrder = async (orderId, rating, review) => {
  const response = await api.post('/order/rate', { orderId, rating, review })
  return response.data
}

export const getOrderStatus = async (id) => {
  const response = await api.get(`/order/status/${id}`)
  return response.data
}

export const getOrderTimeline = async (id) => {
  const response = await api.get(`/order/timeline/${id}`)
  return response.data
}

export const getEstimatedTime = async (id) => {
  const response = await api.get(`/order/eta/${id}`)
  return response.data
}

export const addInstructions = async (orderId, instructions) => {
  const response = await api.post('/order/instructions', { orderId, instructions })
  return response.data
}