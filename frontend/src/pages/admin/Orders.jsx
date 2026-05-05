import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getAdminOrders, updateOrderStatus, assignDeliveryBoy, getDeliveryBoys } from '../../services/admin'
import toast from 'react-hot-toast'
import '../../styles/admin/common.css'      // ✅ ADD THIS
import '../../styles/admin/orders.css'      

const Orders = () => {
  const { token } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [deliveryBoys, setDeliveryBoys] = useState([])
  const [selectedDeliveryBoy, setSelectedDeliveryBoy] = useState('')
  const [statusUpdate, setStatusUpdate] = useState({
    status: '',
    remarks: ''
  })

  const statusOptions = ['pending', 'confirmed', 'preparing', 'ready', 'assigned', 'accepted', 'picked_up', 'out_for_delivery', 'delivered', 'cancelled']

  useEffect(() => {
    fetchOrders()
    fetchDeliveryBoys()
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const response = await getAdminOrders()
      setOrders(response.orders || [])
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const fetchDeliveryBoys = async () => {
    try {
      const response = await getDeliveryBoys()
      setDeliveryBoys(response.deliveries || [])
    } catch (error) {
      console.error('Failed to fetch delivery boys:', error)
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
    } catch (error) {
      toast.error(error.response?.data?.message || 'Status update failed')
    }
  }

  const handleAssignDelivery = async () => {
    if (!selectedDeliveryBoy) {
      toast.error('Please select a delivery boy')
      return
    }
    try {
      await assignDeliveryBoy(selectedOrder._id, selectedDeliveryBoy)
      toast.success('Delivery boy assigned successfully')
      setShowAssignModal(false)
      setSelectedDeliveryBoy('')
      setSelectedOrder(null)
      fetchOrders()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Assignment failed')
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
    <div className="admin-container">
      <div className="admin-header">
        <h1>Order Management</h1>
      </div>

      <div className="orders-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total Amount</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Delivery Boy</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="9" className="no-data">No orders found</td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order._id}>
                  <td>{order.orderId}</td>
                  <td>{order.userId?.name || 'N/A'}</td>
                  <td>{order.items?.length || 0} items</td>
                  <td>₹{order.finalAmount}</td>
                  <td>{order.paymentMethod?.toUpperCase()}</td>
                  <td>
                    <span style={getStatusBadge(order.status)}>
                      {order.status?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td>{order.deliveryBoy?.name || 'Not Assigned'}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button 
                      className="edit-btn" 
                      onClick={() => {
                        setSelectedOrder(order)
                        setShowStatusModal(true)
                      }}
                    >
                      Update Status
                    </button>
                    {(!order.deliveryBoy || order.status === 'ready') && (
                      <button 
                        className="assign-btn"
                        onClick={() => {
                          setSelectedOrder(order)
                          setShowAssignModal(true)
                        }}
                      >
                        Assign
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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
                {statusOptions.map(status => (
                  <option key={status} value={status}>
                    {status.replace(/_/g, ' ').toUpperCase()}
                  </option>
                ))}
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

      {/* Assign Delivery Boy Modal */}
      {showAssignModal && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Assign Delivery Boy</h2>
            <p className="modal-subtitle">Order: {selectedOrder?.orderId}</p>

            <div className="form-group">
              <label>Select Delivery Boy *</label>
              <select
                value={selectedDeliveryBoy}
                onChange={(e) => setSelectedDeliveryBoy(e.target.value)}
                required
              >
                <option value="">Select Delivery Boy</option>
                {deliveryBoys.filter(boy => boy.kycStatus === 'approved' && boy.isOnline).map((boy) => (
                  <option key={boy.id || boy._id} value={boy.id || boy._id}>
                    {boy.name} - {boy.phone || 'No phone'}
                  </option>
                ))}
              </select>
            </div>

            <div className="modal-buttons">
              <button className="btn-secondary" onClick={() => setShowAssignModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleAssignDelivery}>Assign</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Orders