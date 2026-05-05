import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getUserOrders, cancelOrder, reorder, rateOrder, getOrderTimeline, getEstimatedTime } from '../../services/order'
import toast from 'react-hot-toast'
import '../../styles/user/Orders.css'

const Orders = () => {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showRateModal, setShowRateModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [review, setReview] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [timeline, setTimeline] = useState([])
  const [estimatedTime, setEstimatedTime] = useState(null)

  useEffect(() => { fetchOrders() }, [])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const response = await getUserOrders()
      setOrders(response.orders || [])
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelOrder = async () => {
    if (!selectedOrder) return
    try {
      await cancelOrder(selectedOrder._id)
      toast.success('Order cancelled successfully')
      setShowCancelModal(false)
      setSelectedOrder(null)
      fetchOrders()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Cancellation failed')
    }
  }

  const handleReorder = async (order) => {
    try {
      await reorder(order._id)
      toast.success('Reorder placed successfully!')
      fetchOrders()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Reorder failed')
    }
  }

  const handleRateOrder = async () => {
    if (!selectedOrder) return
    try {
      await rateOrder(selectedOrder._id, rating, review)
      toast.success('Thank you for your feedback!')
      setShowRateModal(false)
      setRating(5)
      setReview('')
      setSelectedOrder(null)
      fetchOrders()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit rating')
    }
  }

  const handleViewDetails = async (order) => {
    setSelectedOrder(order)
    try {
      const timelineData = await getOrderTimeline(order._id)
      setTimeline(timelineData || [])
      const eta = await getEstimatedTime(order._id)
      setEstimatedTime(eta)
    } catch (error) {
      console.error('Failed to fetch details:', error)
    }
    setShowDetailsModal(true)
  }

  const filteredOrders = statusFilter === 'all'
    ? orders
    : orders.filter(order => order.status === statusFilter)

  const getStatusConfig = (status) => {
    const map = {
      pending:          { bg: 'rgba(255,193,7,0.10)',   border: 'rgba(255,193,7,0.20)',   color: '#ffc107', icon: '⏳', text: 'Pending' },
      confirmed:        { bg: 'rgba(23,162,184,0.10)',  border: 'rgba(23,162,184,0.20)',  color: '#17a2b8', icon: '✓',  text: 'Confirmed' },
      preparing:        { bg: 'rgba(253,126,20,0.10)',  border: 'rgba(253,126,20,0.20)',  color: '#fd7e14', icon: '🍳', text: 'Preparing' },
      ready:            { bg: 'rgba(111,66,193,0.10)',  border: 'rgba(111,66,193,0.20)',  color: '#6f42c1', icon: '✅', text: 'Ready' },
      assigned:         { bg: 'rgba(40,167,69,0.10)',   border: 'rgba(40,167,69,0.20)',   color: '#28a745', icon: '👨‍🍳', text: 'Assigned' },
      accepted:         { bg: 'rgba(32,201,151,0.10)',  border: 'rgba(32,201,151,0.20)',  color: '#20c997', icon: '👍', text: 'Accepted' },
      picked_up:        { bg: 'rgba(0,123,255,0.10)',   border: 'rgba(0,123,255,0.20)',   color: '#007bff', icon: '📦', text: 'Picked Up' },
      out_for_delivery: { bg: 'rgba(255,107,53,0.12)',  border: 'rgba(255,107,53,0.25)',  color: '#ff6b35', icon: '🚚', text: 'Out for Delivery' },
      delivered:        { bg: 'rgba(40,167,69,0.10)',   border: 'rgba(40,167,69,0.20)',   color: '#4ade80', icon: '✓',  text: 'Delivered' },
      cancelled:        { bg: 'rgba(220,53,69,0.10)',   border: 'rgba(220,53,69,0.20)',   color: '#ff4444', icon: '✕',  text: 'Cancelled' },
    }
    return map[status] || { bg: 'rgba(108,117,125,0.1)', border: 'rgba(108,117,125,0.2)', color: '#6c757d', icon: '📋', text: status }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  const getProgressPercentage = (status) => {
    const stages = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered']
    const idx = stages.indexOf(status)
    return idx === -1 ? 0 : ((idx + 1) / stages.length) * 100
  }

  if (loading) {
    return (
      <div className="orders-loading">
        <div className="loading-spinner-gold"></div>
        <p>Loading your orders...</p>
      </div>
    )
  }

  return (
    <div className="orders-container">
      <div className="container">

        {/* Header */}
        <div className="orders-header">
          <div className="header-content">
            <h1><span className="gold-text">My</span> Orders</h1>
            <p className="order-count">
              {filteredOrders.length} {filteredOrders.length === 1 ? 'Order' : 'Orders'}
            </p>
          </div>

          <div className="filter-section">
            <div className="filter-tabs">
              {[
                { key: 'all',              label: 'All',              icon: '📋' },
                { key: 'pending',          label: 'Pending',          icon: '⏳' },
                { key: 'confirmed',        label: 'Confirmed',        icon: '✓' },
                { key: 'preparing',        label: 'Preparing',        icon: '🍳' },
                { key: 'out_for_delivery', label: 'Out for Delivery', icon: '🚚' },
                { key: 'delivered',        label: 'Delivered',        icon: '🏠' },
                { key: 'cancelled',        label: 'Cancelled',        icon: '✕' },
              ].map(({ key, label, icon }) => (
                <button
                  key={key}
                  className={`filter-tab ${statusFilter === key ? 'active' : ''}`}
                  onClick={() => setStatusFilter(key)}
                >
                  <span>{icon}</span> {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Orders */}
        {filteredOrders.length === 0 ? (
          <div className="no-orders">
            <div className="no-orders-icon">📦</div>
            <h3>No orders found</h3>
            <p>Looks like you haven't placed any orders yet</p>
            <button className="btn-shop-now" onClick={() => window.location.href = '/'}>
              Start Shopping →
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {filteredOrders.map((order, index) => {
              const statusConfig = getStatusConfig(order.status)
              return (
                <div
                  className="order-card"
                  key={order._id}
                  style={{ animationDelay: `${index * 0.08}s` }}
                >
                  {/* Card Header */}
                  <div className="order-card-header">
                    <div className="order-info">
                      <div className="order-id-wrapper">
                        <span className="order-id-icon">🛍️</span>
                        <span className="order-id">Order #{order.orderId}</span>
                      </div>
                      <div className="order-meta">
                        <span>📅 {formatDate(order.createdAt)}</span>
                        {order.estimatedDelivery && (
                          <span>⏱️ Est. {order.estimatedDelivery}</span>
                        )}
                      </div>
                    </div>
                    <span
                      className="order-status-badge"
                      style={{
                        background: statusConfig.bg,
                        border: `1px solid ${statusConfig.border}`,
                        color: statusConfig.color
                      }}
                    >
                      {statusConfig.icon} {statusConfig.text}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  {order.status !== 'cancelled' && order.status !== 'delivered' && (
                    <div className="order-progress">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${getProgressPercentage(order.status)}%` }}
                        />
                      </div>
                      <div className="progress-stages">
                        {['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'].map((s) => (
                          <span key={s} className={order.status === s ? 'active' : ''}>
                            {s === 'out_for_delivery' ? 'Delivery' : s.charAt(0).toUpperCase() + s.slice(1)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Card Body */}
                  <div className="order-card-body">
                    <div className="order-items">
                      <div className="items-label">Items Ordered</div>
                      {order.items?.slice(0, 3).map((item, idx) => (
                        <div className="order-item" key={idx}>
                          <div className="item-info">
                            <span className="item-quantity">{item.quantity}x</span>
                            <span className="item-name">{item.name}</span>
                          </div>
                          <span className="item-price">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                      {order.items?.length > 3 && (
                        <div className="more-items">+{order.items.length - 3} more items</div>
                      )}
                    </div>

                    <div className="order-summary">
                      <div className="summary-row">
                        <span>Subtotal</span>
                        <span>₹{order.totalAmount || order.finalAmount}</span>
                      </div>
                      {order.discount > 0 && (
                        <div className="summary-row discount">
                          <span>Discount</span>
                          <span>-₹{order.discount}</span>
                        </div>
                      )}
                      {order.deliveryFee > 0 && (
                        <div className="summary-row">
                          <span>Delivery Fee</span>
                          <span>₹{order.deliveryFee}</span>
                        </div>
                      )}
                      <div className="summary-row total">
                        <span>Total Paid</span>
                        <span className="total-amount">₹{order.finalAmount}</span>
                      </div>
                    </div>

                    <div className="order-delivery-info">
                      <span className="info-icon">📍</span>
                      <div className="info-text">
                        <strong>Delivery Address</strong>
                        <p>{order.address}</p>
                      </div>
                    </div>

                    {order.instructions && (
                      <div className="order-delivery-info">
                        <span className="info-icon">📝</span>
                        <div className="info-text">
                          <strong>Special Instructions</strong>
                          <p>{order.instructions}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="order-card-footer">
                    <button className="btn-details" onClick={() => handleViewDetails(order)}>
                      🔍 View Details
                    </button>
                    {order.status === 'pending' && (
                      <button
                        className="btn-cancel"
                        onClick={() => { setSelectedOrder(order); setShowCancelModal(true) }}
                      >
                        ✕ Cancel Order
                      </button>
                    )}
                    {order.status === 'delivered' && !order.rating && (
                      <button
                        className="btn-rate"
                        onClick={() => { setSelectedOrder(order); setShowRateModal(true) }}
                      >
                        ⭐ Rate Order
                      </button>
                    )}
                    {order.status === 'delivered' && (
                      <button className="btn-reorder" onClick={() => handleReorder(order)}>
                        🔄 Reorder
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="modal-content cancel-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">⚠️</div>
            <h2>Cancel Order</h2>
            <p>Are you sure you want to cancel this order? This action cannot be undone.</p>
            <div className="modal-buttons">
              <button className="btn-secondary" onClick={() => setShowCancelModal(false)}>Keep Order</button>
              <button className="btn-danger" onClick={handleCancelOrder}>Yes, Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Rate Modal */}
      {showRateModal && (
        <div className="modal-overlay" onClick={() => setShowRateModal(false)}>
          <div className="modal-content rate-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">⭐</div>
            <h2>Rate Your Order</h2>
            <p>How was your experience?</p>
            <div className="rating-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`star ${star <= (hoverRating || rating) ? 'active' : ''}`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                >★</span>
              ))}
            </div>
            <div className="form-group">
              <label>Write a Review (Optional)</label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                rows="4"
                placeholder="Share your experience..."
              />
            </div>
            <div className="modal-buttons">
              <button className="btn-secondary" onClick={() => setShowRateModal(false)}>Maybe Later</button>
              <button className="btn-primary" onClick={handleRateOrder}>Submit Rating</button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order Details</h2>
              <button className="modal-close" onClick={() => setShowDetailsModal(false)}>✕</button>
            </div>

            <div className="details-section">
              <h3>Order Information</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Order ID</span>
                  <span className="detail-value">#{selectedOrder.orderId}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Placed On</span>
                  <span className="detail-value">{formatDate(selectedOrder.createdAt)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Payment</span>
                  <span className="detail-value">{selectedOrder.paymentMethod || 'Cash on Delivery'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Status</span>
                  <span className={`payment-status ${selectedOrder.paymentStatus}`}>
                    {selectedOrder.paymentStatus || 'Pending'}
                  </span>
                </div>
              </div>
            </div>

            <div className="details-section">
              <h3>Items Ordered</h3>
              {selectedOrder.items?.map((item, idx) => (
                <div className="detail-item-row" key={idx}>
                  <div className="item-detail-info">
                    <span className="item-qty">{item.quantity}x</span>
                    <span className="item-name">{item.name}</span>
                  </div>
                  <span className="item-price">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            {timeline.length > 0 && (
              <div className="details-section">
                <h3>Order Timeline</h3>
                <div className="timeline">
                  {timeline.map((event, idx) => (
                    <div className="timeline-item" key={idx}>
                      <div className="timeline-dot"></div>
                      <div className="timeline-content">
                        <div className="timeline-title">{event.status}</div>
                        <div className="timeline-date">{formatDate(event.timestamp)}</div>
                        {event.note && <div className="timeline-note">{event.note}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {estimatedTime && (
              <div className="details-section estimated-time">
                <div className="eta-info">
                  <span className="eta-icon">⏱️</span>
                  <div>
                    <strong>Estimated Delivery Time</strong>
                    <p>{estimatedTime} minutes</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Orders