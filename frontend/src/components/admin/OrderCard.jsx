import React, { useState, useCallback, useMemo } from 'react'
import './OrderCard.css'

const OrderCard = ({ order, onUpdateStatus, onAssignDelivery, onViewDetails, availableDeliveryBoys = [] }) => {
    const [showDetails, setShowDetails] = useState(false)
    const [showStatusModal, setShowStatusModal] = useState(false)
    const [showAssignModal, setShowAssignModal] = useState(false)
    const [selectedStatus, setSelectedStatus] = useState(order.status)
    const [remarks, setRemarks] = useState('')
    const [selectedDeliveryBoy, setSelectedDeliveryBoy] = useState('')
    const [isUpdating, setIsUpdating] = useState(false)

    const statusOptions = useMemo(() => [
        { value: 'pending', label: 'Pending', color: '#ffc107', icon: '⏳', description: 'Order received, awaiting confirmation' },
        { value: 'confirmed', label: 'Confirmed', color: '#17a2b8', icon: '✓', description: 'Order confirmed by restaurant' },
        { value: 'preparing', label: 'Preparing', color: '#fd7e14', icon: '🍳', description: 'Food is being prepared' },
        { value: 'ready', label: 'Ready', color: '#6f42c1', icon: '✅', description: 'Order ready for pickup' },
        { value: 'assigned', label: 'Assigned', color: '#28a745', icon: '👤', description: 'Delivery partner assigned' },
        { value: 'accepted', label: 'Accepted', color: '#20c997', icon: '👍', description: 'Delivery partner accepted' },
        { value: 'picked_up', label: 'Picked Up', color: '#007bff', icon: '📦', description: 'Order picked up from restaurant' },
        { value: 'out_for_delivery', label: 'Out for Delivery', color: '#ff6b35', icon: '🚚', description: 'On the way to customer' },
        { value: 'delivered', label: 'Delivered', color: '#28a745', icon: '🏠', description: 'Successfully delivered' },
        { value: 'cancelled', label: 'Cancelled', color: '#dc3545', icon: '❌', description: 'Order cancelled' }
    ], [])

    const getStatusInfo = useCallback((status) => {
        return statusOptions.find(opt => opt.value === status) || statusOptions[0]
    }, [statusOptions])

    const statusInfo = getStatusInfo(order.status)

    const canUpdateStatus = useMemo(() => {
        return order.status !== 'delivered' && order.status !== 'cancelled'
    }, [order.status])

    const canAssignDelivery = useMemo(() => {
        return order.status === 'ready' && !order.deliveryBoy && !order.deliveryPartner
    }, [order.status, order.deliveryBoy, order.deliveryPartner])

    const formatDate = useCallback((dateString) => {
        if (!dateString) return 'N/A'
        const date = new Date(dateString)
        return date.toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }, [])

    const getRelativeTime = useCallback((dateString) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffMs = now - date
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 1) return 'Just now'
        if (diffMins < 60) return `${diffMins} minutes ago`
        if (diffHours < 24) return `${diffHours} hours ago`
        return `${diffDays} days ago`
    }, [])

    const getPaymentMethodIcon = useCallback((method) => {
        const icons = {
            cod: '💵',
            razorpay: '💳',
            wallet: '👛',
            card: '💳',
            upi: '📱',
            paytm: '📱',
            googlepay: '📱'
        }
        return icons[method?.toLowerCase()] || '💰'
    }, [])

    const getPaymentMethodLabel = useCallback((method) => {
        const labels = {
            cod: 'Cash on Delivery',
            razorpay: 'Razorpay',
            wallet: 'Wallet',
            card: 'Card Payment',
            upi: 'UPI Payment',
            paytm: 'Paytm',
            googlepay: 'Google Pay'
        }
        return labels[method?.toLowerCase()] || method?.toUpperCase() || 'Unknown'
    }, [])

    const handleStatusUpdate = useCallback(async () => {
        if (selectedStatus === order.status) {
            setShowStatusModal(false)
            return
        }

        setIsUpdating(true)
        try {
            await onUpdateStatus(order._id, selectedStatus, remarks)
            setShowStatusModal(false)
            setRemarks('')
        } catch (error) {
            console.error('Status update failed:', error)
        } finally {
            setIsUpdating(false)
        }
    }, [selectedStatus, order.status, order._id, remarks, onUpdateStatus])

    const handleAssignDelivery = useCallback(async () => {
        if (!selectedDeliveryBoy) {
            alert('Please select a delivery partner')
            return
        }

        setIsUpdating(true)
        try {
            await onAssignDelivery(order._id, selectedDeliveryBoy)
            setShowAssignModal(false)
            setSelectedDeliveryBoy('')
        } catch (error) {
            console.error('Assignment failed:', error)
        } finally {
            setIsUpdating(false)
        }
    }, [selectedDeliveryBoy, order._id, onAssignDelivery])

    const toggleDetails = useCallback((e) => {
        e.stopPropagation()
        setShowDetails(prev => !prev)
    }, [])

    const canProceedToNext = useMemo(() => {
        const statusFlow = ['pending', 'confirmed', 'preparing', 'ready', 'assigned', 'accepted', 'picked_up', 'out_for_delivery', 'delivered']
        const currentIndex = statusFlow.indexOf(order.status)
        const nextStatus = statusFlow[currentIndex + 1]
        return nextStatus && order.status !== 'delivered' && order.status !== 'cancelled'
    }, [order.status])

    const handleQuickNext = useCallback(() => {
        const statusFlow = ['pending', 'confirmed', 'preparing', 'ready', 'assigned', 'accepted', 'picked_up', 'out_for_delivery', 'delivered']
        const currentIndex = statusFlow.indexOf(order.status)
        const nextStatus = statusFlow[currentIndex + 1]
        if (nextStatus) {
            setSelectedStatus(nextStatus)
            setShowStatusModal(true)
        }
    }, [order.status])

    return (
        <>
            <div className={`order-card ${order.status} ${showDetails ? 'expanded' : ''}`}>
                {/* Card Header */}
                <div className="order-card-header">
                    <div className="order-info">
                        <div className="order-id-wrapper">
                            <span className="order-id-icon">📋</span>
                            <span className="order-id">#{order.orderId || order._id?.slice(-8)}</span>
                        </div>
                        <div className="order-date">
                            <span className="date-icon">📅</span>
                            <span>{formatDate(order.createdAt)}</span>
                        </div>
                        <div className="order-relative-time">
                            <span className="time-icon">⏱️</span>
                            <span>{getRelativeTime(order.createdAt)}</span>
                        </div>
                    </div>
                    
                    <div className="order-badges">
                        <div className="status-badge" style={{ background: statusInfo.color }}>
                            <span className="badge-icon">{statusInfo.icon}</span>
                            <span className="badge-text">{statusInfo.label}</span>
                        </div>
                        <div className="payment-badge" title={getPaymentMethodLabel(order.paymentMethod)}>
                            <span className="badge-icon">{getPaymentMethodIcon(order.paymentMethod)}</span>
                            <span className="badge-text">{getPaymentMethodLabel(order.paymentMethod)}</span>
                        </div>
                        {order.isRush && (
                            <div className="rush-badge" title="Rush Order">
                                <span>⚡ Rush</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Card Body */}
                <div className="order-card-body">
                    <div className="order-customer">
                        <div className="customer-avatar">
                            {order.userId?.name?.charAt(0) || order.customerName?.charAt(0) || 'G'}
                        </div>
                        <div className="customer-info">
                            <strong>{order.userId?.name || order.customerName || 'Guest User'}</strong>
                            <span>
                                <span className="info-icon">📞</span>
                                {order.userId?.phone || order.customerPhone || 'No phone'}
                            </span>
                            {order.userId?.email && (
                                <span className="customer-email">
                                    <span className="info-icon">✉️</span>
                                    {order.userId?.email}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="order-summary">
                        <div className="summary-card">
                            <div className="summary-icon">🍽️</div>
                            <div className="summary-info">
                                <span className="summary-value">{order.items?.length || 0}</span>
                                <span className="summary-label">Items</span>
                            </div>
                        </div>
                        <div className="summary-card">
                            <div className="summary-icon">💰</div>
                            <div className="summary-info">
                                <span className="summary-value">₹{(order.finalAmount || order.totalAmount)?.toLocaleString()}</span>
                                <span className="summary-label">Total</span>
                            </div>
                        </div>
                        {order.deliveryBoy && (
                            <div className="summary-card">
                                <div className="summary-icon">🚚</div>
                                <div className="summary-info">
                                    <span className="summary-value">{order.deliveryBoy.name}</span>
                                    <span className="summary-label">Delivery Partner</span>
                                </div>
                            </div>
                        )}
                        {order.estimatedDeliveryTime && (
                            <div className="summary-card">
                                <div className="summary-icon">⏰</div>
                                <div className="summary-info">
                                    <span className="summary-value">{order.estimatedDeliveryTime} min</span>
                                    <span className="summary-label">Est. Delivery</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="order-address">
                        <span className="address-icon">📍</span>
                        <div className="address-text">
                            <strong>Delivery Address:</strong>
                            <span>{order.address || order.deliveryAddress || 'No address provided'}</span>
                        </div>
                    </div>

                    {canProceedToNext && (
                        <button className="quick-next-btn" onClick={handleQuickNext}>
                            <span>→</span> Mark as Next Stage
                        </button>
                    )}
                </div>

                {/* Expanded Details */}
                {showDetails && (
                    <div className="order-card-details">
                        {/* Order Items */}
                        <div className="details-section">
                            <div className="section-header">
                                <h4>
                                    <span className="section-icon">🍽️</span>
                                    Order Items
                                </h4>
                                <span className="item-count">{order.items?.length || 0} items</span>
                            </div>
                            <div className="items-list">
                                {order.items?.map((item, idx) => (
                                    <div className="order-item" key={idx}>
                                        <div className="item-info">
                                            <span className="item-quantity">{item.quantity}x</span>
                                            <span className="item-name">{item.name}</span>
                                            {item.specialInstructions && (
                                                <span className="item-note" title={item.specialInstructions}>📝</span>
                                            )}
                                        </div>
                                        <div className="item-price-info">
                                            <span className="item-price">₹{item.price}</span>
                                            <span className="item-total">₹{(item.price * item.quantity).toLocaleString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Price Breakdown */}
                        <div className="details-section">
                            <h4>
                                <span className="section-icon">💰</span>
                                Price Breakdown
                            </h4>
                            <div className="price-breakdown">
                                <div className="price-row">
                                    <span>Subtotal</span>
                                    <span>₹{(order.totalAmount || order.subtotal)?.toLocaleString()}</span>
                                </div>
                                {(order.discount > 0 || order.couponDiscount) && (
                                    <div className="price-row discount">
                                        <span>Discount Applied</span>
                                        <span>-₹{(order.discount || order.couponDiscount)?.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="price-row">
                                    <span>Delivery Fee</span>
                                    <span>₹{(order.deliveryFee || 40)?.toLocaleString()}</span>
                                </div>
                                <div className="price-row">
                                    <span>Packaging Charge</span>
                                    <span>₹{(order.packagingCharge || 0)?.toLocaleString()}</span>
                                </div>
                                <div className="price-row">
                                    <span>Tax (GST)</span>
                                    <span>₹{(order.tax || 0)?.toLocaleString()}</span>
                                </div>
                                <div className="price-row total">
                                    <span>Total Amount</span>
                                    <span>₹{(order.finalAmount || order.total)?.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Status Timeline */}
                        {order.statusHistory && order.statusHistory.length > 0 && (
                            <div className="details-section">
                                <h4>
                                    <span className="section-icon">📊</span>
                                    Status Timeline
                                </h4>
                                <div className="timeline">
                                    {order.statusHistory.map((history, idx) => (
                                        <div className={`timeline-item ${history.status === order.status ? 'current' : ''}`} key={idx}>
                                            <div className="timeline-dot"></div>
                                            <div className="timeline-content">
                                                <div className="timeline-status">
                                                    <span className="status-icon">{getStatusInfo(history.status).icon}</span>
                                                    <span>{getStatusInfo(history.status).label}</span>
                                                </div>
                                                <div className="timeline-date">{formatDate(history.timestamp)}</div>
                                                {history.remarks && <div className="timeline-remarks">{history.remarks}</div>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Special Instructions */}
                        {order.instructions && (
                            <div className="details-section special-instructions">
                                <h4>
                                    <span className="section-icon">📝</span>
                                    Special Instructions
                                </h4>
                                <p>{order.instructions}</p>
                            </div>
                        )}

                        {/* Additional Info */}
                        <div className="details-footer">
                            <div className="detail-row">
                                <span className="detail-label">Order Type:</span>
                                <span className="detail-value">{order.orderType || 'Standard'}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Payment Status:</span>
                                <span className={`detail-value payment-status ${order.paymentStatus || 'pending'}`}>
                                    {order.paymentStatus === 'paid' ? '✅ Paid' : '⏳ Pending'}
                                </span>
                            </div>
                            {order.couponCode && (
                                <div className="detail-row">
                                    <span className="detail-label">Coupon Applied:</span>
                                    <span className="detail-value coupon-code">{order.couponCode}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Card Actions */}
                <div className="order-card-actions">
                    <button className="action-btn details-btn" onClick={toggleDetails}>
                        <span className="btn-icon">{showDetails ? '▲' : '▼'}</span>
                        <span>{showDetails ? 'Hide Details' : 'View Details'}</span>
                    </button>

                    {canUpdateStatus && (
                        <button
                            className="action-btn update-btn"
                            onClick={(e) => {
                                e.stopPropagation()
                                setSelectedStatus(order.status)
                                setShowStatusModal(true)
                            }}
                        >
                            <span className="btn-icon">📝</span>
                            <span>Update Status</span>
                        </button>
                    )}

                    {canAssignDelivery && (
                        <button
                            className="action-btn assign-btn"
                            onClick={(e) => {
                                e.stopPropagation()
                                setShowAssignModal(true)
                            }}
                        >
                            <span className="btn-icon">👤</span>
                            <span>Assign Delivery</span>
                        </button>
                    )}

                    <button
                        className="action-btn view-btn"
                        onClick={(e) => {
                            e.stopPropagation()
                            onViewDetails(order._id)
                        }}
                    >
                        <span className="btn-icon">🔍</span>
                        <span>Full Details</span>
                    </button>
                </div>
            </div>

            {/* Update Status Modal */}
            {showStatusModal && (
                <div className="modal-overlay" onClick={() => setShowStatusModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title">
                                <span className="modal-icon">📝</span>
                                <h2>Update Order Status</h2>
                            </div>
                            <button className="modal-close" onClick={() => setShowStatusModal(false)}>×</button>
                        </div>
                        <p className="modal-subtitle">Order #{order.orderId || order._id?.slice(-8)}</p>

                        <div className="form-group">
                            <label>Select Status</label>
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="status-select"
                            >
                                {statusOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.icon} {opt.label} - {opt.description}
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
                                placeholder="Add any remarks about this status update..."
                                className="remarks-textarea"
                            />
                        </div>

                        <div className="modal-buttons">
                            <button className="btn-secondary" onClick={() => setShowStatusModal(false)}>
                                Cancel
                            </button>
                            <button className="btn-primary" onClick={handleStatusUpdate} disabled={isUpdating}>
                                {isUpdating ? 'Updating...' : 'Update Status'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Assign Delivery Modal */}
            {showAssignModal && (
                <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title">
                                <span className="modal-icon">🚚</span>
                                <h2>Assign Delivery Partner</h2>
                            </div>
                            <button className="modal-close" onClick={() => setShowAssignModal(false)}>×</button>
                        </div>
                        <p className="modal-subtitle">Order #{order.orderId || order._id?.slice(-8)}</p>

                        <div className="form-group">
                            <label>Select Delivery Partner</label>
                            <select
                                value={selectedDeliveryBoy}
                                onChange={(e) => setSelectedDeliveryBoy(e.target.value)}
                                className="delivery-select"
                            >
                                <option value="">-- Select a delivery partner --</option>
                                {availableDeliveryBoys.map(boy => (
                                    <option key={boy._id} value={boy._id}>
                                        {boy.name} - {boy.phone} {boy.isOnline ? '🟢 Online' : boy.isOnBreak ? '⏸️ On Break' : '⚫ Offline'}
                                    </option>
                                ))}
                            </select>
                            {availableDeliveryBoys.length === 0 && (
                                <p className="error-hint">No delivery partners available at the moment</p>
                            )}
                        </div>

                        <div className="modal-buttons">
                            <button className="btn-secondary" onClick={() => setShowAssignModal(false)}>
                                Cancel
                            </button>
                            <button 
                                className="btn-primary" 
                                onClick={handleAssignDelivery} 
                                disabled={isUpdating || availableDeliveryBoys.length === 0}
                            >
                                {isUpdating ? 'Assigning...' : 'Assign Delivery'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default OrderCard