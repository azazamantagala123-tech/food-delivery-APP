import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getAssignedOrders, updateOrderStatus, acceptDelivery, rejectDelivery, confirmPickup, confirmDrop, updateLocation } from '../../services/delivery'
import toast from 'react-hot-toast'
import '../../styles/delivery/Orders.css'

const Orders = () => {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [statusUpdate, setStatusUpdate] = useState({ status: '', remarks: '' })
  const [trackingLocation, setTrackingLocation] = useState({ lat: null, lng: null })

  useEffect(() => {
    fetchOrders()
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setTrackingLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
      })
    }
    const interval = setInterval(fetchOrders, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await getAssignedOrders()
      setOrders(response.orders || [])
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const updateCurrentLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        setTrackingLocation(location)
        await updateLocation(location.lat, location.lng)
      })
    }
  }

  const handleAcceptOrder = async (order) => {
    try {
      await acceptDelivery(order._id)
      toast.success('Order accepted successfully')
      fetchOrders()
      updateCurrentLocation()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to accept order')
    }
  }

  const handleRejectOrder = async () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection')
      return
    }
    try {
      await rejectDelivery(selectedOrder._id, rejectReason)
      toast.success('Order rejected')
      setShowRejectModal(false)
      setRejectReason('')
      setSelectedOrder(null)
      fetchOrders()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject order')
    }
  }

  const handleStatusUpdate = async () => {
    if (!statusUpdate.status) {
      toast.error('Please select a status')
      return
    }
    try {
      await updateOrderStatus(selectedOrder._id, statusUpdate.status, statusUpdate.remarks)
      toast.success(`Order status updated to ${statusUpdate.status}`)
      setShowStatusModal(false)
      setStatusUpdate({ status: '', remarks: '' })
      setSelectedOrder(null)
      fetchOrders()
      updateCurrentLocation()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Status update failed')
    }
  }

  const handlePickup = async (order) => {
    try {
      await confirmPickup(order._id)
      toast.success('Order picked up successfully')
      fetchOrders()
      updateCurrentLocation()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Pickup failed')
    }
  }

  const handleDrop = async (order) => {
    try {
      await confirmDrop(order._id)
      toast.success('Order delivered successfully')
      fetchOrders()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delivery failed')
    }
  }

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: '#ffc107',
      confirmed: '#17a2b8',
      preparing: '#fd7e14',
      ready: '#6f42c1',
      assigned: '#28a745',
      accepted: '#20c997',
      picked_up: '#007bff',
      out_for_delivery: '#ff6b35',
      delivered: '#28a745',
      cancelled: '#dc3545'
    }
    return {
      backgroundColor: statusColors[status] || '#6c757d',
      color: 'white',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      textTransform: 'capitalize'
    }
  }

  if (loading) {
    return <div className="loading">Loading orders...</div>
  }

  return (
    <div className="delivery-orders">
      <div className="orders-header">
        <h1>My Orders</h1>
        <button className="btn-location" onClick={updateCurrentLocation}>
          📍 Update Location
        </button>
      </div>

      <div className="orders-list">
        {orders.length === 0 ? (
          <div className="no-orders">
            <p>No orders assigned yet</p>
            <p className="sub-text">Orders will appear here once assigned by admin</p>
          </div>
        ) : (
          orders.map((order) => (
            <div className="order-card" key={order._id}>
              <div className="order-header">
                <div className="order-info">
                  <span className="order-id">{order.orderId}</span>
                  <span style={getStatusBadge(order.status)}>
                    {order.status?.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="order-amount">
                  ₹{order.finalAmount}
                </div>
              </div>

              <div className="order-body">
                <div className="order-customer">
                  <strong>Customer:</strong> {order.userId?.name || 'N/A'}
                  <br />
                  <strong>Phone:</strong> {order.userId?.phone || 'N/A'}
                </div>
                <div className="order-address">
                  <strong>Delivery Address:</strong>
                  <p>{order.address}</p>
                </div>
                <div className="order-items">
                  <strong>Items:</strong>
                  <ul>
                    {order.items?.map((item, idx) => (
                      <li key={idx}>
                        {item.quantity}x {item.name} - ₹{item.price * item.quantity}
                      </li>
                    ))}
                  </ul>
                </div>
                {order.instructions && (
                  <div className="order-instructions">
                    <strong>Special Instructions:</strong>
                    <p>{order.instructions}</p>
                  </div>
                )}
              </div>

              <div className="order-actions">
                {order.status === 'assigned' && (
                  <>
                    <button 
                      className="btn-accept"
                      onClick={() => handleAcceptOrder(order)}
                    >
                      ✅ Accept Order
                    </button>
                    <button 
                      className="btn-reject"
                      onClick={() => {
                        setSelectedOrder(order)
                        setShowRejectModal(true)
                      }}
                    >
                      ❌ Reject
                    </button>
                  </>
                )}
                {order.status === 'accepted' && (
                  <button 
                    className="btn-pickup"
                    onClick={() => handlePickup(order)}
                  >
                    📦 Confirm Pickup
                  </button>
                )}
                {order.status === 'picked_up' && (
                  <button 
                    className="btn-deliver"
                    onClick={() => handleDrop(order)}
                  >
                    🚚 Confirm Delivery
                  </button>
                )}
                {(order.status === 'accepted' || order.status === 'picked_up') && (
                  <button 
                    className="btn-status"
                    onClick={() => {
                      setSelectedOrder(order)
                      setShowStatusModal(true)
                    }}
                  >
                    📝 Update Status
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Update Status Modal */}
      {showStatusModal && (
        <div className="modal-overlay" onClick={() => setShowStatusModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Update Order Status</h2>
            <p className="modal-subtitle">Order: {selectedOrder?.orderId}</p>
            
            <div className="form-group">
              <label>Status *</label>
              <select
                value={statusUpdate.status}
                onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
                required
              >
                <option value="">Select Status</option>
                <option value="picked_up">Picked Up</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>

            <div className="form-group">
              <label>Remarks (Optional)</label>
              <textarea
                value={statusUpdate.remarks}
                onChange={(e) => setStatusUpdate({ ...statusUpdate, remarks: e.target.value })}
                rows="3"
                placeholder="Add any remarks..."
              />
            </div>

            <div className="modal-buttons">
              <button className="btn-secondary" onClick={() => setShowStatusModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleStatusUpdate}>Update</button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Order Modal */}
      {showRejectModal && (
        <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Reject Order</h2>
            <p className="modal-subtitle">Order: {selectedOrder?.orderId}</p>
            
            <div className="form-group">
              <label>Reason for Rejection *</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows="4"
                placeholder="Please provide a reason for rejecting this order..."
                required
              />
            </div>

            <div className="modal-buttons">
              <button className="btn-secondary" onClick={() => setShowRejectModal(false)}>Cancel</button>
              <button className="btn-danger" onClick={handleRejectOrder}>Confirm Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Orders