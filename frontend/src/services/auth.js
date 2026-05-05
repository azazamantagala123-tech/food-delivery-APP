import api from './api'

// Helper for retry
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const withRetry = async (apiCall, retries = 3, delayMs = 2000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await apiCall()
    } catch (error) {
      if (error.response?.status === 429 && i < retries - 1) {
        console.warn(`Rate limited, retrying in ${delayMs}ms... (${i + 1}/${retries})`)
        await delay(delayMs * (i + 1))
        continue
      }
      throw error
    }
  }
}

// ==================== AUTH ====================
export const login = async (endpoint, credentials) => {
  return withRetry(async () => {
    const response = await api.post(endpoint, credentials)
    return response.data
  })
}

export const register = async (endpoint, userData) => {
  return withRetry(async () => {
    const response = await api.post(endpoint, userData)
    return response.data
  })
}

export const guestLogin = async () => {
  return withRetry(async () => {
    const response = await api.post('/auth/guest-login')
    return response.data
  })
}

export const logout = async () => {
  return withRetry(async () => {
    const response = await api.post('/auth/logout')
    return response.data
  })
}

export const refreshToken = async () => {
  return withRetry(async () => {
    const response = await api.post('/auth/refresh-token')
    return response.data
  })
}

// ==================== PROFILE ====================
export const getProfile = async () => {
  return withRetry(async () => {
    const response = await api.get('/user/profile')
    return response.data
  })
}

export const updateProfile = async (data) => {
  return withRetry(async () => {
    const response = await api.put('/user/profile', data)
    return response.data
  })
}

export const changePassword = async (oldPassword, newPassword) => {
  return withRetry(async () => {
    const response = await api.post('/user/change-password', { oldPassword, newPassword })
    return response.data
  })
}

export const uploadAvatar = async (avatar) => {
  return withRetry(async () => {
    const response = await api.post('/user/avatar', { avatar })
    return response.data
  })
}

export const deleteAccount = async () => {
  return withRetry(async () => {
    const response = await api.delete('/user/account')
    return response.data
  })
}

// ==================== ADDRESS ====================
export const getAddresses = async () => {
  return withRetry(async () => {
    const response = await api.get('/user/address')
    return response.data
  })
}

export const addAddress = async (addressData) => {
  return withRetry(async () => {
    const response = await api.post('/user/address', addressData)
    return response.data
  })
}

export const updateAddress = async (id, addressData) => {
  return withRetry(async () => {
    const response = await api.put(`/user/address/${id}`, addressData)
    return response.data
  })
}

export const deleteAddress = async (id) => {
  return withRetry(async () => {
    const response = await api.delete(`/user/address/${id}`)
    return response.data
  })
}

// ==================== WALLET ====================
export const getWallet = async () => {
  return withRetry(async () => {
    const response = await api.get('/user/wallet')
    return response.data
  })
}

export const addMoney = async (amount) => {
  return withRetry(async () => {
    const response = await api.post('/user/wallet/add', { amount })
    return response.data
  })
}

export const getWalletHistory = async () => {
  return withRetry(async () => {
    const response = await api.get('/user/wallet/history')
    return response.data
  })
}

// ==================== NOTIFICATIONS ====================
export const getNotifications = async () => {
  return withRetry(async () => {
    const response = await api.get('/user/notifications')
    return response.data
  })
}

export const markNotificationsRead = async () => {
  return withRetry(async () => {
    const response = await api.post('/user/notifications/read')
    return response.data
  })
}

// ==================== PREFERENCES ====================
export const getPreferences = async () => {
  return withRetry(async () => {
    const response = await api.get('/user/preferences')
    return response.data
  })
}

export const updatePreferences = async (preferences) => {
  return withRetry(async () => {
    const response = await api.put('/user/preferences', preferences)
    return response.data
  })
}

// ==================== ORDERS ====================
export const getUserOrders = async () => {
  return withRetry(async () => {
    const response = await api.get('/user/orders')
    return response.data
  })
}

// ==================== REWARDS & REFERRAL ====================
export const getRewards = async () => {
  return withRetry(async () => {
    const response = await api.get('/user/rewards')
    return response.data
  })
}

export const applyReferral = async (code) => {
  return withRetry(async () => {
    const response = await api.post('/user/referral', { code })
    return response.data
  })
}

// ==================== SUBSCRIPTION ====================
export const getSubscription = async () => {
  return withRetry(async () => {
    const response = await api.get('/user/subscription')
    return response.data
  })
}

export const upgradeSubscription = async (plan) => {
  return withRetry(async () => {
    const response = await api.post('/user/subscription/upgrade', { plan })
    return response.data
  })
}

// ==================== FEEDBACK ====================
export const submitFeedback = async (message, rating) => {
  return withRetry(async () => {
    const response = await api.post('/user/feedback', { message, rating })
    return response.data
  })
}

// ==================== FAVORITES ====================
export const getFavorites = async () => {
  return withRetry(async () => {
    const response = await api.get('/user/favorites')
    return response.data
  })
}

export const addFavorite = async (foodId) => {
  return withRetry(async () => {
    const response = await api.post('/user/favorites/add', { foodId })
    return response.data
  })
}

export const removeFavorite = async (foodId) => {
  return withRetry(async () => {
    const response = await api.delete('/user/favorites/remove', { data: { foodId } })
    return response.data
  })
}

// ==================== ACTIVITY ====================
export const getUserActivity = async () => {
  return withRetry(async () => {
    const response = await api.get('/user/activity')
    return response.data
  })
}

// ==================== SECURITY ====================
export const getLoginHistory = async () => {
  return withRetry(async () => {
    const response = await api.post('/user/login-history')
    return response.data
  })
}

export const getSecuritySettings = async () => {
  return withRetry(async () => {
    const response = await api.get('/user/security-settings')
    return response.data
  })
}

// ==================== SUPPORT ====================
export const createSupportTicket = async (subject, message) => {
  return withRetry(async () => {
    const response = await api.post('/user/support', { subject, message })
    return response.data
  })
}

export const trackSupport = async (id) => {
  return withRetry(async () => {
    const response = await api.get(`/user/support/${id}`)
    return response.data
  })
}

export const reportIssue = async (orderId, issue, description) => {
  return withRetry(async () => {
    const response = await api.post('/user/report-issue', { orderId, issue, description })
    return response.data
  })
}

// ==================== PAYMENT METHODS ====================
export const getPaymentMethods = async () => {
  return withRetry(async () => {
    const response = await api.get('/user/payment-methods')
    return response.data
  })
}

export const addPaymentMethod = async (type, details) => {
  return withRetry(async () => {
    const response = await api.post('/user/add-payment-method', { type, details })
    return response.data
  })
}

export const removePaymentMethod = async (methodId) => {
  return withRetry(async () => {
    const response = await api.delete('/user/remove-payment-method', { data: { methodId } })
    return response.data
  })
}

// ==================== LOYALTY ====================
export const getLoyaltyTier = async () => {
  return withRetry(async () => {
    const response = await api.get('/user/loyalty-tier')
    return response.data
  })
}

// ==================== NOTIFICATION SETTINGS ====================
export const updateNotificationSettings = async (settings) => {
  return withRetry(async () => {
    const response = await api.post('/user/notification-settings', settings)
    return response.data
  })
}

// ==================== OTP ====================
export const verifyOTP = async (email, otp) => {
  return withRetry(async () => {
    const response = await api.post('/auth/verify-otp', { email, otp })
    return response.data
  })
}

export const resendOTP = async (email) => {
  return withRetry(async () => {
    const response = await api.post('/auth/resend-otp', { email })
    return response.data
  })
}

// ==================== FORGOT PASSWORD ====================
export const forgotPassword = async (email) => {
  return withRetry(async () => {
    const response = await api.post('/auth/forgot-password', { email })
    return response.data
  })
}

export const resetPassword = async (resetToken, newPassword) => {
  return withRetry(async () => {
    const response = await api.post('/auth/reset-password', { resetToken, newPassword })
    return response.data
  })
}

// ==================== SOCIAL LOGIN ====================
export const socialLogin = async (provider, token) => {
  return withRetry(async () => {
    const response = await api.post('/auth/social-login', { provider, token })
    return response.data
  })
}

// ==================== EMAIL VERIFICATION ====================
export const verifyEmail = async (verificationToken) => {
  return withRetry(async () => {
    const response = await api.post('/auth/email-verify', { token: verificationToken })
    return response.data
  })
}

export const resendEmailVerification = async (email) => {
  return withRetry(async () => {
    const response = await api.post('/auth/email-resend', { email })
    return response.data
  })
}