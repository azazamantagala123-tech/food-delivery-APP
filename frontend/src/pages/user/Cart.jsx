import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useCart } from '../../contexts/CartContext'
import { createOrder } from '../../services/order'
import { codPayment, walletPayment } from '../../services/payment'
import toast from 'react-hot-toast'
import '../../styles/user/Cart.css'

const Cart = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { cart, loading, updateItemQuantity, removeItem, emptyCart, applyCouponCode, removeCouponCode, fetchCart } = useCart()
  const [couponCode, setCouponCode] = useState('')
  const [applyingCoupon, setApplyingCoupon] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [savedForLater, setSavedForLater] = useState([])

  useEffect(() => {
    fetchCart()
  }, [])

  const handleQuantityChange = async (foodId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change
    if (newQuantity < 1) {
      await removeItem(foodId)
    } else {
      await updateItemQuantity(foodId, newQuantity)
    }
  }

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter coupon code')
      return
    }
    setApplyingCoupon(true)
    const result = await applyCouponCode(couponCode)
    if (result.success) {
      toast.success(`Coupon applied! You saved ₹${result.discount}`)
      setCouponCode('')
    } else {
      toast.error(result.message)
    }
    setApplyingCoupon(false)
  }

  const handleRemoveCoupon = async () => {
    await removeCouponCode()
    toast.success('Coupon removed')
  }

  const handleSaveForLater = (item) => {
    setSavedForLater([...savedForLater, item])
    removeItem(item.foodId)
    toast.success('Item saved for later')
  }

  const handleMoveToCart = (item) => {
    // Add back to cart logic
    setSavedForLater(savedForLater.filter(i => i.foodId !== item.foodId))
    toast.success('Item moved to cart')
  }

  const handleCheckout = async (paymentMethod) => {
    if (!cart?.items?.length) {
      toast.error('Cart is empty')
      return
    }

    setCheckoutLoading(true)
    try {
      const orderData = {
        items: cart.items.map(item => ({
          foodId: item.foodId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          specialInstructions: item.specialInstructions
        })),
        totalAmount: cart.subtotal,
        address: 'Sector 62, Noida, Uttar Pradesh - 201301',
        paymentMethod: paymentMethod
      }

      const orderResponse = await createOrder(orderData)
      const orderId = orderResponse.order?.id

      if (!orderId) {
        throw new Error('Order creation failed')
      }

      let paymentResponse
      if (paymentMethod === 'cod') {
        paymentResponse = await codPayment(orderId)
      } else if (paymentMethod === 'wallet') {
        paymentResponse = await walletPayment(orderId)
      }

      if (paymentResponse?.success) {
        toast.success('Order placed successfully!')
        await emptyCart()
        navigate('/orders')
      } else {
        toast.error(paymentResponse?.message || 'Payment failed')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error(error.response?.data?.message || 'Failed to place order')
    } finally {
      setCheckoutLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="cart-loading">
        <div className="loading-spinner"></div>
        <p>Loading your cart...</p>
      </div>
    )
  }

  if (!cart || cart.items?.length === 0) {
    return (
      <div className="cart-empty">
        <div className="empty-cart-content">
          <div className="empty-cart-icon">🛒</div>
          <h2>Your Cart is Empty</h2>
          <p>Looks like you haven't added any items to your cart yet.</p>
          <button className="btn-browse" onClick={() => navigate('/')}>
            Browse Menu
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="cart-header">
          <h1>Shopping Cart</h1>
          <p>{cart.items.length} {cart.items.length === 1 ? 'item' : 'items'}</p>
        </div>

        <div className="cart-content">
          <div className="cart-items-section">
            <div className="cart-items-header">
              <div className="product-col">Product Details</div>
              <div className="price-col">Price</div>
              <div className="quantity-col">Quantity</div>
              <div className="total-col">Total</div>
              <div className="action-col"></div>
            </div>

            {cart.items.map((item) => (
              <div className="cart-item" key={item._id}>
                <div className="item-product">
                  <div className="item-image">
                    <img src={item.image || 'https://via.placeholder.com/80'} alt={item.name} />
                    {item.isVeg && <span className="veg-badge">🍀</span>}
                  </div>
                  <div className="item-details">
                    <h4>{item.name}</h4>
                    {item.specialInstructions && (
                      <p className="item-note">📝 {item.specialInstructions}</p>
                    )}
                    <div className="item-actions">
                      <button className="action-btn save-later" onClick={() => handleSaveForLater(item)}>
                        Save for Later
                      </button>
                    </div>
                  </div>
                </div>
                <div className="item-price">₹{item.price}</div>
                <div className="item-quantity">
                  <div className="quantity-control">
                    <button 
                      className="qty-btn minus"
                      onClick={() => handleQuantityChange(item.foodId, item.quantity, -1)}
                    >
                      −
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button 
                      className="qty-btn plus"
                      onClick={() => handleQuantityChange(item.foodId, item.quantity, 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="item-total">₹{item.price * item.quantity}</div>
                <div className="item-remove">
                  <button className="remove-btn" onClick={() => removeItem(item.foodId)}>
                    ✕
                  </button>
                </div>
              </div>
            ))}

            {savedForLater.length > 0 && (
              <div className="saved-for-later">
                <h3>Saved for Later</h3>
                {savedForLater.map((item) => (
                  <div className="saved-item" key={item.foodId}>
                    <div className="saved-item-info">
                      <img src={item.image} alt={item.name} />
                      <span>{item.name}</span>
                    </div>
                    <button onClick={() => handleMoveToCart(item)}>Move to Cart</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="cart-summary-section">
            <div className="summary-card">
              <h3>Order Summary</h3>
              
              <div className="summary-details">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>₹{cart.subtotal}</span>
                </div>
                {cart.discount > 0 && (
                  <div className="summary-row discount">
                    <span>Discount</span>
                    <span className="discount-amount">-₹{cart.discount}</span>
                  </div>
                )}
                <div className="summary-row">
                  <span>Delivery Fee</span>
                  <span className={cart.deliveryFee === 0 ? 'free' : ''}>
                    {cart.deliveryFee === 0 ? 'FREE' : `₹${cart.deliveryFee}`}
                  </span>
                </div>
                {cart.tip > 0 && (
                  <div className="summary-row">
                    <span>Tip</span>
                    <span>₹{cart.tip}</span>
                  </div>
                )}
                <div className="summary-row">
                  <span>GST (5%)</span>
                  <span>₹{cart.tax}</span>
                </div>
                <div className="summary-divider"></div>
                <div className="summary-row total">
                  <span>Total Amount</span>
                  <span className="total-amount">₹{cart.total}</span>
                </div>
              </div>

              <div className="coupon-section">
                {cart.couponCode ? (
                  <div className="applied-coupon">
                    <div className="coupon-info">
                      <span className="coupon-icon">🏷️</span>
                      <span>{cart.couponCode} applied</span>
                      <span className="coupon-savings">Saved ₹{cart.discount}</span>
                    </div>
                    <button className="remove-coupon" onClick={handleRemoveCoupon}>
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="coupon-input-wrapper">
                    <div className="coupon-input-group">
                      <span className="input-icon">🎫</span>
                      <input
                        type="text"
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="coupon-input"
                      />
                      <button 
                        className="apply-coupon-btn" 
                        onClick={handleApplyCoupon} 
                        disabled={applyingCoupon}
                      >
                        {applyingCoupon ? 'Applying...' : 'Apply'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="payment-section">
                <h4>Choose Payment Method</h4>
                <div className="payment-options">
                  <button 
                    className={`payment-option ${checkoutLoading ? 'disabled' : ''}`}
                    onClick={() => handleCheckout('cod')}
                    disabled={checkoutLoading}
                  >
                    <span className="payment-icon">💵</span>
                    <div className="payment-info">
                      <strong>Cash on Delivery</strong>
                      <small>Pay when you receive</small>
                    </div>
                  </button>
                  
                  <button 
                    className={`payment-option wallet ${checkoutLoading ? 'disabled' : ''}`}
                    onClick={() => handleCheckout('wallet')}
                    disabled={checkoutLoading}
                  >
                    <span className="payment-icon">👛</span>
                    <div className="payment-info">
                      <strong>Wallet</strong>
                      <small>Instant payment</small>
                    </div>
                  </button>
                </div>
              </div>

              <button 
                className="checkout-btn" 
                onClick={() => handleCheckout('cod')}
                disabled={checkoutLoading}
              >
                {checkoutLoading ? (
                  <>
                    <span className="spinner"></span>
                    Processing...
                  </>
                ) : (
                  <>Proceed to Checkout →</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart