import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './OrderItem.css'

const OrderItem = ({ order, onCancel, onReorder, onRate }) => {
  const navigate = useNavigate()
  const [showDetails, setShowDetails] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showRateModal, setShowRateModal] = useState(false)
  const [rating, setRating] = useState(5)
  const [review, setReview] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusConfig = (status) => {
    const configs = {
      pending: { class: 'pending', icon: '⏳', text: 'Pending', color: '#ffc107' },
      confirmed: { class: 'confirmed', icon: '✓', text: 'Confirmed', color: '#17a2b8' },
      preparing: { class: 'preparing', icon: '🍳', text: 'Preparing', color: '#fd7e14' },
      ready: { class: 'ready', icon: '✅', text: 'Ready', color: '#6f42c1' },
      assigned: { class: 'assigned', icon: '👤', text: 'Assigned', color: '#28a745' },
      accepted: { class: 'accepted', icon: '👍', text: 'Accepted', color: '#20c997' },
      picked_up: { class: 'picked-up', icon: '📦', text: 'Picked Up', color: '#007bff' },
      out_for_delivery: { class: 'out-for-delivery', icon: '🚚', text: 'Out for Delivery', color: '#ff6b35' },
      delivered: { class: 'delivered', icon: '🏠', text: 'Delivered', color: '#28a745' },
      cancelled: { class: 'cancelled', icon: '❌', text: 'Cancelled', color: '#dc3545' }
    }
    return configs[status] || configs.pending
  }

  const statusConfig = getStatusConfig(order.status)

  const getPaymentMethodIcon = (method) => {
    const icons = {
      cod: '💵',
      razorpay: '💳',
      wallet: '👛',
      card: '💳',
      upi: '📱'
    }
    return icons[method] || '💰'
  }

  const canCancel = ['pending', 'confirmed'].includes(order.status)
  const canReorder = order.status === 'delivered'
  const canRate = order.status === 'delivered' && !order.rating

  const handleCancel = async () => {
    setIsSubmitting(true)
    await onCancel(order._id)
    setIsSubmitting(false)
    setShowCancelModal(false)
  }

  const handleReorder = async () => {
    setIsSubmitting(true)
    await onReorder(order._id)
    setIsSubmitting(false)
  }

  const handleRate = async () => {
    setIsSubmitting(true)
    await onRate(order._id, rating, review)
    setIsSubmitting(false)
    setShowRateModal(false)
    setRating(5)
    setReview('')
  }

  const handleTrackOrder = () => {
    navigate(`/orders/${order._id}/track`)
  }

  const handleViewDetails = () => {
    navigate(`/orders/${order._id}`)
  }

  const statusSteps = [
    { key: 'confirmed', label: 'Confirmed', icon: '✓' },
    { key: 'preparing', label: 'Preparing', icon: '🍳' },
    { key: 'picked_up', label: 'Picked Up', icon: '📦' },
    { key: 'out_for_delivery', label: 'Out for Delivery', icon: '🚚' },
    { key: 'delivered', label: 'Delivered', icon: '🏠' }
  ]

  const getCurrentStep = () => {
    const statusOrder = ['confirmed', 'preparing', 'picked_up', 'out_for_delivery', 'delivered']
    const currentIndex = statusOrder.indexOf(order.status)
    return currentIndex >= 0 ? currentIndex : -1
  }

  return (
    <>
      <div className="order-item">
        <div className="order-item-header">
          <div className="order-header-left">
            <span className="order-id">Order #{order.orderId}</span>
            <span className="order-date">{formatDate(order.createdAt)}</span>
          </div>
          <div className="order-header-right">
            <span className="payment-badge">
              {getPaymentMethodIcon(order.paymentMethod)} {order.paymentMethod?.toUpperCase()}
            </span>
            <span className={`status-badge ${statusConfig.class}`}>
              {statusConfig.icon} {statusConfig.text}
            </span>
          </div>
        </div>

        <div className="order-item-body">
          <div className="order-items-preview">
            <div className="items-summary">
              <span className="items-count">{order.items?.length || 0} items</span>
              <span className="items-total">₹{order.finalAmount?.toLocaleString()}</span>
            </div>
            <div className="items-list-preview">
              {order.items?.slice(0, 3).map((item, idx) => (
                <span key={idx} className="preview-item">
                  {item.quantity}x {item.name}
                </span>
              ))}
              {order.items?.length > 3 && (
                <span className="more-items">+{order.items.length - 3} more</span>
              )}
            </div>
          </div>

          <div className="order-address">
            <span className="address-icon">📍</span>
            <span className="address-text">{order.address}</span>
          </div>

          {order.deliveryBoy && (
            <div className="delivery-info">
              <span className="delivery-icon">🚚</span>
              <span className="delivery-text">
                Delivered by: {order.deliveryBoy.name}
              </span>
            </div>
          )}

          {order.status !== 'delivered' && order.status !== 'cancelled' && (
            <div className="order-tracking">
              <div className="tracking-steps">
                {statusSteps.map((step, index) => {
                  const isCompleted = getCurrentStep() >= index
                  const isCurrent = getCurrentStep() === index
                  return (
                    <div key={step.key} className={`tracking-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
                      <div className="step-dot">{step.icon}</div>
                      <div className="step-label">{step.label}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <div className="order-item-footer">
          <button 
            className="footer-btn view-details"
            onClick={handleViewDetails}
          >
            View Details
          </button>
          
          {order.status !== 'delivered' && order.status !== 'cancelled' && (
            <button 
              className="footer-btn track-order"
              onClick={handleTrackOrder}
            >
              Track Order
            </button>
          )}
          
          {canCancel && (
            <button 
              className="footer-btn cancel-order"
              onClick={() => setShowCancelModal(true)}
              disabled={isSubmitting}
            >
              Cancel Order
            </button>
          )}
          
          {canReorder && (
            <button 
              className="footer-btn reorder"
              onClick={handleReorder}
              disabled={isSubmitting}
            >
              Reorder
            </button>
          )}
          
          {canRate && (
            <button 
              className="footer-btn rate-order"
              onClick={() => setShowRateModal(true)}
            >
              Rate Order
            </button>
          )}
        </div>

        <button 
          className="expand-btn"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? '▲ Hide Details' : '▼ Show Details'}
        </button>

        {showDetails && (
          <div className="order-item-details">
            <div className="details-section">
              <h4>Order Items</h4>
              <div className="items-list">
                {order.items?.map((item, idx) => (
                  <div className="detail-item" key={idx}>
                    <div className="item-info">
                      <span className="item-quantity">{item.quantity}x</span>
                      <span className="item-name">{item.name}</span>
                      {item.specialInstructions && (
                        <span className="item-instruction">({item.specialInstructions})</span>
                      )}
                    </div>
                    <span className="item-price">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="details-section">
              <h4>Price Summary</h4>
              <div className="price-breakdown">
                <div className="price-row">
                  <span>Subtotal</span>
                  <span>₹{order.totalAmount?.toLocaleString()}</span>
                </div>
                {order.discount > 0 && (
                  <div className="price-row discount">
                    <span>Discount</span>
                    <span>-₹{order.discount}</span>
                  </div>
                )}
                <div className="price-row">
                  <span>Delivery Fee</span>
                  <span>₹{order.deliveryFee || 40}</span>
                </div>
                <div className="price-row">
                  <span>Tax (GST)</span>
                  <span>₹{order.tax || 0}</span>
                </div>
                <div className="price-row total">
                  <span>Total Paid</span>
                  <span>₹{order.finalAmount?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {order.instructions && (
              <div className="details-section">
                <h4>Special Instructions</h4>
                <p className="instructions">{order.instructions}</p>
              </div>
            )}

            {order.statusHistory && order.statusHistory.length > 0 && (
              <div className="details-section">
                <h4>Order Timeline</h4>
                <div className="timeline">
                  {order.statusHistory.map((history, idx) => (
                    <div className="timeline-item" key={idx}>
                      <div className="timeline-dot"></div>
                      <div className="timeline-content">
                        <div className="timeline-status">{history.status}</div>
                        <div className="timeline-date">{formatDate(history.timestamp)}</div>
                        {history.remarks && <div className="timeline-remarks">{history.remarks}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
            <h2>Cancel Order</h2>
            <p>Are you sure you want to cancel order <strong>#{order.orderId}</strong>?</p>
            <p className="warning-text">This action cannot be undone.</p>
            <div className="modal-buttons">
              <button className="btn-secondary" onClick={() => setShowCancelModal(false)}>
                Go Back
              </button>
              <button className="btn-danger" onClick={handleCancel} disabled={isSubmitting}>
                {isSubmitting ? 'Cancelling...' : 'Yes, Cancel Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rate Order Modal */}
      {showRateModal && (
        <div className="modal-overlay" onClick={() => setShowRateModal(false)}>
          <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
            <h2>Rate Your Order</h2>
            <p>How was your experience with order <strong>#{order.orderId}</strong>?</p>
            
            <div className="rating-section">
              <div className="stars-container">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span 
                    key={star}
                    className={`star ${star <= rating ? 'active' : ''}`}
                    onClick={() => setRating(star)}
                  >
                    ★
                  </span>
                ))}
              </div>
              <div className="rating-labels">
                <span>Poor</span>
                <span>Fair</span>
                <span>Good</span>
                <span>Very Good</span>
                <span>Excellent</span>
              </div>
            </div>

            <div className="form-group">
              <label>Write a Review (Optional)</label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                rows="3"
                placeholder="Share your experience with this order..."
              />
            </div>

            <div className="modal-buttons">
              <button className="btn-secondary" onClick={() => setShowRateModal(false)}>
                Maybe Later
              </button>
              <button className="btn-primary" onClick={handleRate} disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Rating'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default OrderItem