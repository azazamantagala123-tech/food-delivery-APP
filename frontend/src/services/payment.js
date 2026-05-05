import api from './api'

export const initiatePayment = async (orderId, method) => {
  const response = await api.post('/payment/initiate', { orderId, method })
  return response.data
}

export const verifyPayment = async (razorpay_order_id, razorpay_payment_id, razorpay_signature) => {
  const response = await api.post('/payment/verify', { razorpay_order_id, razorpay_payment_id, razorpay_signature })
  return response.data
}

export const getPaymentHistory = async () => {
  const response = await api.get('/payment/history')
  return response.data
}

export const getPaymentMethods = async () => {
  const response = await api.get('/payment/methods')
  return response.data
}

export const walletPayment = async (orderId) => {
  const response = await api.post('/payment/wallet', { orderId })
  return response.data
}

export const codPayment = async (orderId) => {
  const response = await api.post('/payment/cod', { orderId })
  return response.data
}

export const requestRefund = async (paymentId, reason) => {
  const response = await api.post('/payment/refund', { paymentId, reason })
  return response.data
}