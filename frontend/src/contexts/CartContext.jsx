import React, { createContext, useState, useContext, useEffect, useCallback } from 'react'
import { 
  getCart, 
  addToCart, 
  updateQuantity, 
  removeFromCart, 
  clearCart, 
  applyCoupon, 
  removeCoupon,
  getCartSummary,
  addTip,
  saveCart,
  restoreCart
} from '../services/cart'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

const CartContext = createContext()

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [savedCartId, setSavedCartId] = useState(null)
  const { user } = useAuth()

  // Fetch cart when user logs in
  useEffect(() => {
    if (user) {
      fetchCart()
    } else {
      setCart(null)
    }
  }, [user])

  // Fetch cart from API
  const fetchCart = useCallback(async () => {
    if (!user) return
    
    setLoading(true)
    setError(null)
    try {
      const response = await getCart()
      setCart(response.cart)
      return response.cart
    } catch (error) {
      console.error('Failed to fetch cart:', error)
      setError(error.response?.data?.message || 'Failed to load cart')
      toast.error('Failed to load cart')
      return null
    } finally {
      setLoading(false)
    }
  }, [user])

  // Get cart summary
  const fetchCartSummary = useCallback(async () => {
    try {
      const response = await getCartSummary()
      return response.summary
    } catch (error) {
      console.error('Failed to fetch cart summary:', error)
      return null
    }
  }, [])

  // Add item to cart
  const addItem = async (foodId, quantity = 1, specialInstructions = '') => {
    if (!user) {
      toast.error('Please login to add items to cart')
      return { success: false, message: 'Please login first' }
    }

    try {
      const response = await addToCart(foodId, quantity, specialInstructions)
      await fetchCart()
      toast.success('Item added to cart')
      return { success: true, cart: response.cart }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add item'
      toast.error(message)
      return { success: false, message }
    }
  }

  // Update item quantity
  const updateItemQuantity = async (foodId, quantity) => {
    try {
      await updateQuantity(foodId, quantity)
      await fetchCart()
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update quantity'
      toast.error(message)
      return { success: false, message }
    }
  }

  // Remove item from cart
  const removeItem = async (foodId) => {
    try {
      await removeFromCart(foodId)
      await fetchCart()
      toast.success('Item removed from cart')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to remove item'
      toast.error(message)
      return { success: false, message }
    }
  }

  // Clear entire cart
  const emptyCart = async () => {
    try {
      await clearCart()
      await fetchCart()
      toast.success('Cart cleared')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to clear cart'
      toast.error(message)
      return { success: false, message }
    }
  }

  // Apply coupon
  const applyCouponCode = async (code) => {
    try {
      const response = await applyCoupon(code)
      await fetchCart()
      toast.success(`Coupon applied! You saved ₹${response.discount}`)
      return { success: true, discount: response.discount, finalAmount: response.finalAmount }
    } catch (error) {
      const message = error.response?.data?.message || 'Invalid coupon'
      toast.error(message)
      return { success: false, message }
    }
  }

  // Remove coupon
  const removeCouponCode = async () => {
    try {
      await removeCoupon()
      await fetchCart()
      toast.success('Coupon removed')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to remove coupon'
      toast.error(message)
      return { success: false, message }
    }
  }

  // Add tip to cart
  const addTipToCart = async (tipAmount) => {
    try {
      await addTip(tipAmount)
      await fetchCart()
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add tip'
      toast.error(message)
      return { success: false, message }
    }
  }

  // Save cart for later
  const saveCurrentCart = async () => {
    try {
      const response = await saveCart()
      setSavedCartId(response.savedCartId)
      toast.success('Cart saved for later')
      return { success: true, savedCartId: response.savedCartId }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to save cart'
      toast.error(message)
      return { success: false, message }
    }
  }

  // Restore saved cart
  const restoreSavedCart = async (cartId) => {
    try {
      await restoreCart(cartId)
      await fetchCart()
      toast.success('Cart restored')
      setSavedCartId(null)
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to restore cart'
      toast.error(message)
      return { success: false, message }
    }
  }

  // Calculate totals
  const subtotal = cart?.subtotal || 0
  const discount = cart?.discount || 0
  const deliveryFee = cart?.deliveryFee || 40
  const tax = cart?.tax || 0
  const tip = cart?.tip || 0
  const total = cart?.total || 0
  const itemCount = cart?.itemCount || 0
  const freeDeliveryEligible = cart?.freeDeliveryEligible || false

  const value = {
    // State
    cart,
    loading,
    error,
    savedCartId,
    
    // Cart data shortcuts
    items: cart?.items || [],
    subtotal,
    discount,
    deliveryFee,
    tax,
    tip,
    total,
    itemCount,
    freeDeliveryEligible,
    couponCode: cart?.couponCode,
    couponDiscount: cart?.couponDiscount,
    tipAmount: cart?.tipAmount,
    
    // Methods
    fetchCart,
    fetchCartSummary,
    addItem,
    updateItemQuantity,
    removeItem,
    emptyCart,
    applyCouponCode,
    removeCouponCode,
    addTipToCart,
    saveCurrentCart,
    restoreSavedCart,
    
    // Helpers
    isEmpty: itemCount === 0,
    hasItems: itemCount > 0,
    hasCoupon: !!cart?.couponCode
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export default CartProvider