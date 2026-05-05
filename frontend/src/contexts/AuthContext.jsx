import React, { createContext, useState, useContext, useEffect, useCallback } from 'react'
import { login as apiLogin, register as apiRegister, getProfile } from '../services/auth'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  const fetchProfile = useCallback(async (retry = 0) => {
    if (!token) {
      setIsLoading(false)
      return
    }

    try {
      const response = await getProfile()
      if (response.user) {
        setUser(response.user)
        setIsAuthenticated(true)
      } else if (response.data?.user) {
        setUser(response.data.user)
        setIsAuthenticated(true)
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      
      // ✅ Retry on 429 with delay
      if (error.response?.status === 429 && retry < 3) {
        const delay = 2000 * (retry + 1)
        console.log(`Rate limited, retrying profile fetch in ${delay}ms...`)
        setTimeout(() => fetchProfile(retry + 1), delay)
        return
      }
      
      // If token is invalid, logout
      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        setToken(null)
      }
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const login = async (email, password) => {
    try {
      // Try user login
      let response = await apiLogin('/auth/user/login', { email, password })
      
      if (!response.accessToken && !response.token) {
        response = await apiLogin('/auth/delivery/login', { email, password })
      }
      
      if (!response.accessToken && !response.token) {
        response = await apiLogin('/auth/admin/login', { email, password })
      }
      
      const accessToken = response.accessToken || response.token
      
      if (accessToken) {
        localStorage.setItem('token', accessToken)
        setToken(accessToken)
        
        // Fetch user profile after login
        const profileRes = await getProfile()
        const userData = profileRes.user || profileRes.data?.user
        
        if (userData) {
          setUser(userData)
          setIsAuthenticated(true)
          return { success: true, user: userData, role: userData.role }
        }
      }
      
      return { success: false, message: response.message || 'Invalid credentials' }
    } catch (error) {
      console.error('Login error:', error)
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed. Please try again.'
      }
    }
  }

  const register = async (userData, role = 'user') => {
    try {
      const endpoint = role === 'delivery' ? '/auth/delivery/register' : '/auth/user/register'
      const response = await apiRegister(endpoint, userData)
      
      if (response.success === false) {
        return { success: false, message: response.message }
      }
      
      return { success: true, user: response.user }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed. Please try again.'
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    setIsAuthenticated(false)
    toast.success('Logged out successfully')
  }

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated,
    userRole: user?.role,
    login,
    register,
    logout,
    isAdmin: () => user?.role === 'admin',
    isDelivery: () => user?.role === 'delivery',
    isUser: () => user?.role === 'user',
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider