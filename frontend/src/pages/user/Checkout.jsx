import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useCart } from '../../contexts/CartContext'
import { createOrder } from '../../services/order'
import { initiatePayment, verifyPayment, codPayment, walletPayment } from '../../services/payment'
import { getAddresses } from '../../services/auth'
import toast from 'react-hot-toast'
import '../../styles/user/Checkout.css'

const Checkout = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { cart, loading: cartLoading, emptyCart, fetchCart } = useCart()
  const [addresses, setAddresses] = useState([])
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [loading, setLoading] = useState(false)
  const [showAddAddress, setShowAddAddress] = useState(false)
  const [newAddress, setNewAddress] = useState({
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: ''
  })

  useEffect(() => {
    fetchAddresses()
    fetchCart()
  }, [])

  const fetchAddresses = async () => {
    try {
      const response = await getAddresses()
      setAddresses(response.addresses || [])
      const defaultAddress = response.addresses?.find(addr => addr.isDefault)
      if (defaultAddress) {
        setSelectedAddress(defaultAddress)
      } else if (response.addresses?.length > 0) {
        setSelectedAddress(response.addresses[0])
      }
    } catch (error) {
      console.error('Failed to fetch addresses:', error)
    }
  }

  const handleAddAddress = async (e) => {
    e.preventDefault()
    // This would call addAddress API
    toast.success('Address added successfully')
    setShowAddAddress(false)
    fetchAddresses()
  }

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please select a delivery address')
      return
    }
    if (!cart?.items?.length) {
      toast.error('Cart is empty')
      return
    }

    setLoading(true)
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
        address: `${selectedAddress.address}, ${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.pincode}`,
        deliveryLocation: {
          lat: 26.9124,
          lng: 75.7873,
          address: selectedAddress.address
        },
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
      } else if (paymentMethod === 'razorpay') {
        const initiateRes = await initiatePayment(orderId, 'razorpay')
        if (initiateRes.success && initiateRes.razorpayOrderId) {
          // Load Razorpay script and open checkout
          const script = document.createElement('script')
          script.src = 'https://checkout.razorpay.com/v1/checkout.js'
          script.onload = () => {
            const options = {
              key: initiateRes.keyId,
              amount: initiateRes.amount * 100,
              currency: 'INR',
              name: 'Food Delivery App',
              description: `Order #${orderId}`,
              order_id: initiateRes.razorpayOrderId,
              handler: async (response) => {
                const verifyRes = await verifyPayment(
                  response.razorpay_order_id,
                  response.razorpay_payment_id,
                  response.razorpay_signature
                )
                if (verifyRes.success) {
                  toast.success('Payment successful! Order placed.')
                  await emptyCart()
                  navigate('/orders')
                } else {
                  toast.error('Payment verification failed')
                }
              },
              prefill: {
                name: user?.name,
                email: user?.email,
                contact: user?.phone
              },
              theme: {
                color: '#ff6b35'
              }
            }
            const razorpay = new window.Razorpay(options)
            razorpay.open()
          }
          document.body.appendChild(script)
          setLoading(false)
          return
        } else {
          throw new Error('Payment initiation failed')
        }
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
      setLoading(false)
    }
  }

  if (cartLoading) {
    return <div className="loading">Loading...</div>
  }

  if (!cart || cart.items?.length === 0) {
    return (
      <div className="checkout-empty">
        <div className="container">
          <h2>Cart is Empty</h2>
          <p>Add items to your cart before checkout</p>
          <button className="btn-primary" onClick={() => navigate('/')}>
            Browse Menu
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="checkout-container">
      <div className="container">
        <h1>Checkout</h1>
        
        <div className="checkout-grid">
          <div className="checkout-left">
            {/* Delivery Address */}
            <div className="checkout-section">
              <h2>Delivery Address</h2>
              {addresses.length === 0 && !showAddAddress ? (
                <button className="btn-add-address" onClick={() => setShowAddAddress(true)}>
                  + Add New Address
                </button>
              ) : (
                <>
                  {addresses.map((addr) => (
                    <label key={addr._id} className="address-option">
                      <input
                        type="radio"
                        name="address"
                        checked={selectedAddress?._id === addr._id}
                        onChange={() => setSelectedAddress(addr)}
                      />
                      <div className="address-details">
                        <p>{addr.address}</p>
                        <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                        <p>Phone: {addr.phone}</p>
                      </div>
                    </label>
                  ))}
                  <button className="btn-add-address" onClick={() => setShowAddAddress(true)}>
                    + Add New Address
                  </button>
                </>
              )}

              {showAddAddress && (
                <form onSubmit={handleAddAddress} className="add-address-form">
                  <h3>Add New Address</h3>
                  <div className="form-group">
                    <input
                      type="text"
                      placeholder="Address"
                      value={newAddress.address}
                      onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <input
                        type="text"
                        placeholder="City"
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <input
                        type="text"
                        placeholder="State"
                        value={newAddress.state}
                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <input
                        type="text"
                        placeholder="Pincode"
                        value={newAddress.pincode}
                        onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <input
                        type="tel"
                        placeholder="Phone"
                        value={newAddress.phone}
                        onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-buttons">
                    <button type="button" onClick={() => setShowAddAddress(false)}>Cancel</button>
                    <button type="submit">Save Address</button>
                  </div>
                </form>
              )}
            </div>

            {/* Payment Method */}
            <div className="checkout-section">
              <h2>Payment Method</h2>
              <label className="payment-option">
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                />
                <span>💵 Cash on Delivery</span>
              </label>
              <label className="payment-option">
                <input
                  type="radio"
                  name="payment"
                  value="wallet"
                  checked={paymentMethod === 'wallet'}
                  onChange={() => setPaymentMethod('wallet')}
                />
                <span>👛 Wallet</span>
              </label>
              <label className="payment-option">
                <input
                  type="radio"
                  name="payment"
                  value="razorpay"
                  checked={paymentMethod === 'razorpay'}
                  onChange={() => setPaymentMethod('razorpay')}
                />
                <span>💳 Card/UPI (Razorpay)</span>
              </label>
            </div>
          </div>

          <div className="checkout-right">
            <div className="order-summary">
              <h2>Order Summary</h2>
              <div className="summary-items">
                {cart.items.map((item) => (
                  <div className="summary-item" key={item._id}>
                    <span>{item.quantity}x {item.name}</span>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{cart.subtotal}</span>
              </div>
              {cart.discount > 0 && (
                <div className="summary-row discount">
                  <span>Discount</span>
                  <span>-₹{cart.discount}</span>
                </div>
              )}
              <div className="summary-row">
                <span>Delivery Fee</span>
                <span>₹{cart.deliveryFee}</span>
              </div>
              <div className="summary-row tax">
                <span>Tax (GST)</span>
                <span>₹{cart.tax}</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>₹{cart.total}</span>
              </div>
              <button 
                className="btn-place-order" 
                onClick={handlePlaceOrder}
                disabled={loading || !selectedAddress}
              >
                {loading ? 'Processing...' : `Place Order • ₹${cart.total}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout