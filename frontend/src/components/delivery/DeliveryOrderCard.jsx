import React, { useState } from 'react'
import './DeliveryOrderCard.css'

const DeliveryOrderCard = ({ 
  order, 
  onAccept, 
  onReject, 
  onPickup, 
  onDrop, 
  onUpdateStatus,
  onNavigate 
}) => {
  const [showDetails, setShowDetails] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [selectedStatus, setSelectedStatus] = useState(order.status)
  const [remarks, setRemarks] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusConfig = (status) => {
    const configs = {
      pending: { class: 'pending', icon: '⏳', label: 'Pending', color: '#ffc107' },
      confirmed: { class: 'confirmed', icon: '✓', label: 'Confirmed', color: '#17a2b8' },
      preparing: { class: 'preparing', icon: '🍳', label: 'Preparing', color: '#fd7e14' },
      ready: { class: 'ready', icon: '✅', label: 'Ready', color: '#6f42c1' },
      assigned: { class: 'assigned', icon: '👤', label: 'Assigned', color: '#28a745' },
      accepted: { class: 'accepted', icon: '👍', label: 'Accepted', color: '#20c997' },
      picked_up: { class: 'picked-up', icon: '📦', label: 'Picked Up', color: '#007bff' },
      out_for_delivery: { class: 'out-for-delivery', icon: '🚚', label: 'Out for Delivery', color: '#ff6b35' },
      delivered: { class: 'delivered', icon: '🏠', label: 'Delivered', color: '#28a745' },
      cancelled: { class: 'cancelled', icon: '❌', label: 'Cancelled', color: '#dc3545' }
    }
    return configs[status] || configs.pending
  }

  const statusConfig = getStatusConfig(order.status)

  const getDistance = () => {
    // Calculate distance from current location to delivery location
    // This is a placeholder - implement actual distance calculation
    const distance = Math.floor(Math.random() * 10) + 1
    return `${distance} km`
  }

  const getEstimateTime = () => {
    const time = Math.floor(Math.random() * 30) + 15
    return `${time} min`
  }

  const handleAccept = async () => {
    setIsSubmitting(true)
    await onAccept(order._id)
    setIsSubmitting(false)
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection')
      return
    }
    setIsSubmitting(true)
    await onReject(order._id, rejectReason)
    setIsSubmitting(false)
    setShowRejectModal(false)
    setRejectReason('')
  }

  const handlePickup = async () => {
    setIsSubmitting(true)
    await onPickup(order._id)
    setIsSubmitting(false)
  }

  const handleDrop = async () => {
    setIsSubmitting(true)
    await onDrop(order._id)
    setIsSubmitting(false)
  }

  const handleStatusUpdate = async () => {
    if (selectedStatus === order.status) {
      setShowStatusModal(false)
      return
    }
    setIsSubmitting(true)
    await onUpdateStatus(order._id, selectedStatus, remarks)
    setIsSubmitting(false)
    setShowStatusModal(false)
    setRemarks('')
  }

  const handleNavigate = () => {
    if (onNavigate) {
      onNavigate(order.deliveryLocation)
    }
  }

  const statusSteps = [
    { key: 'confirmed', label: 'Confirmed', icon: '✓' },
    { key: 'preparing', label: 'Preparing', icon: '🍳' },
    { key: 'ready', label: 'Ready', icon: '✅' },
    { key: 'picked_up', label: 'Picked Up', icon: '📦' },
    { key: 'out_for_delivery', label: 'Out for Delivery', icon: '🚚' },
    { key: 'delivered', label: 'Delivered', icon: '🏠' }
  ]

  const getCurrentStep = () => {
    const statusOrder = ['confirmed', 'preparing', 'ready', 'picked_up', 'out_for_delivery', 'delivered']
    const currentIndex = statusOrder.indexOf(order.status)
    return currentIndex >= 0 ? currentIndex : -1
  }

  const statusOptions = [
    { value: 'accepted', label: 'Accept Order', icon: '👍' },
    { value: 'picked_up', label: 'Picked Up', icon: '📦' },
    { value: 'out_for_delivery', label: 'Out for Delivery', icon: '🚚' },
    { value: 'delivered', label: 'Delivered', icon: '🏠' }
  ]

  return (
    <>
      <div className="delivery-order-card">
        <div className="order-card-header">
          <div className="order-info">
            <span className="order-id">#{order.orderId}</span>
            <span className="order-date">{formatDate(order.createdAt)}</span>
          </div>
          <div className="order-badges">
            <span className="distance-badge">📏 {getDistance()}</span>
            <span className="eta-badge">⏱️ {getEstimateTime()}</span>
            <span className={`status-badge ${statusConfig.class}`}>
              {statusConfig.icon} {statusConfig.label}
            </span>
          </div>
        </div>

        <div className="order-card-body">
          <div className="customer-section">
            <div className="customer-avatar">
              {order.userId?.name?.charAt(0) || 'C'}
            </div>
            <div className="customer-details">
              <h4>{order.userId?.name || 'Customer'}</h4>
              <p>📞 {order.userId?.phone || 'No phone'}</p>
            </div>
          </div>

          <div className="delivery-address">
            <div className="address-icon">📍</div>
            <div className="address-details">
              <strong>Delivery Address</strong>
              <p>{order.address}</p>
              {order.deliveryLocation && (
                <div className="location-coords">
                  Lat: {order.deliveryLocation.lat}, Lng: {order.deliveryLocation.lng}
                </div>
              )}
            </div>
          </div>

          <div className="order-items">
            <div className="items-header">
              <span>🍽️ Items ({order.items?.length || 0})</span>
              <button 
                className="toggle-details"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? 'Hide' : 'Show'}
              </button>
            </div>
            <div className="items-preview">
              {order.items?.slice(0, 2).map((item, idx) => (
                <span key={idx} className="preview-item">
                  {item.quantity}x {item.name}
                </span>
              ))}
              {order.items?.length > 2 && (
                <span className="more-items">+{order.items.length - 2} more</span>
              )}
            </div>
          </div>

          <div className="order-amount">
            <span>💰 Total Amount</span>
            <strong>₹{order.finalAmount?.toLocaleString()}</strong>
          </div>

          {order.instructions && (
            <div className="special-instructions">
              <span className="instructions-icon">📝</span>
              <span>{order.instructions}</span>
            </div>
          )}

          {/* Tracking Progress */}
          {(order.status === 'accepted' || order.status === 'picked_up' || order.status === 'out_for_delivery') && (
            <div className="tracking-progress">
              <div className="progress-steps">
                {statusSteps.map((step, index) => {
                  const isCompleted = getCurrentStep() >= index
                  const isCurrent = getCurrentStep() === index
                  return (
                    <div key={step.key} className={`progress-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
                      <div className="step-dot">{step.icon}</div>
                      <div className="step-label">{step.label}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {showDetails && (
          <div className="order-card-details">
            <div className="details-section">
              <h4>📋 All Items</h4>
              <div className="items-list">
                {order.items?.map((item, idx) => (
                  <div className="detail-item" key={idx}>
                    <div className="item-info">
                      <span className="item-quantity">{item.quantity}x</span>
                      <span className="item-name">{item.name}</span>
                    </div>
                    <span className="item-price">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="details-section">
              <h4>💰 Payment Details</h4>
              <div className="payment-breakdown">
                <div className="payment-row">
                  <span>Payment Method</span>
                  <span className="payment-method">{order.paymentMethod?.toUpperCase()}</span>
                </div>
                <div className="payment-row">
                  <span>Subtotal</span>
                  <span>₹{order.totalAmount?.toLocaleString()}</span>
                </div>
                {order.discount > 0 && (
                  <div className="payment-row discount">
                    <span>Discount</span>
                    <span>-₹{order.discount}</span>
                  </div>
                )}
                <div className="payment-row">
                  <span>Delivery Fee</span>
                  <span>₹{order.deliveryFee || 40}</span>
                </div>
                <div className="payment-row">
                  <span>Commission (10%)</span>
                  <span>₹{Math.round(order.finalAmount * 0.1)}</span>
                </div>
                <div className="payment-row total">
                  <span>Your Earnings</span>
                  <span>₹{Math.round(order.finalAmount * 0.1)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="order-card-actions">
          {order.status === 'assigned' && (
            <>
              <button 
                className="btn-accept"
                onClick={handleAccept}
                disabled={isSubmitting}
              >
                ✅ Accept Order
              </button>
              <button 
                className="btn-reject"
                onClick={() => setShowRejectModal(true)}
                disabled={isSubmitting}
              >
                ❌ Reject
              </button>
            </>
          )}
          
          {order.status === 'accepted' && (
            <button 
              className="btn-pickup"
              onClick={handlePickup}
              disabled={isSubmitting}
            >
              📦 Confirm Pickup
            </button>
          )}
          
          {order.status === 'picked_up' && (
            <>
              <button 
                className="btn-navigate"
                onClick={handleNavigate}
              >
                🗺️ Navigate
              </button>
              <button 
                className="btn-deliver"
                onClick={handleDrop}
                disabled={isSubmitting}
              >
                🏠 Confirm Delivery
              </button>
            </>
          )}
          
          {order.status === 'out_for_delivery' && (
            <button 
              className="btn-deliver"
              onClick={handleDrop}
              disabled={isSubmitting}
            >
              🏠 Confirm Delivery
            </button>
          )}
          
          {(order.status === 'accepted' || order.status === 'picked_up' || order.status === 'out_for_delivery') && (
            <button 
              className="btn-status"
              onClick={() => setShowStatusModal(true)}
            >
              📝 Update Status
            </button>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Reject Order</h2>
            <p className="modal-subtitle">Order: #{order.orderId}</p>
            
            <div className="form-group">
              <label>Reason for Rejection *</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows="4"
                placeholder="Please provide a reason for rejecting this order..."
                autoFocus
              />
            </div>

            <div className="modal-buttons">
              <button className="btn-secondary" onClick={() => setShowRejectModal(false)}>Cancel</button>
              <button className="btn-danger" onClick={handleReject} disabled={isSubmitting}>
                {isSubmitting ? 'Rejecting...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {showStatusModal && (
        <div className="modal-overlay" onClick={() => setShowStatusModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Update Order Status</h2>
            <p className="modal-subtitle">Order: #{order.orderId}</p>
            
            <div className="form-group">
              <label>Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="status-select"
              >
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.icon} {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Remarks (Optional)</label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows="3"
                placeholder="Add any remarks..."
              />
            </div>

            <div className="modal-buttons">
              <button className="btn-secondary" onClick={() => setShowStatusModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleStatusUpdate} disabled={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default DeliveryOrderCard