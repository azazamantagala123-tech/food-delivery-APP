import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { raiseSupport, getAssignedOrders } from '../../services/delivery'
import toast from 'react-hot-toast'
import '../../styles/delivery/Support.css'

const Support = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [orders, setOrders] = useState([])
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    orderId: ''
  })
  const [recentTickets, setRecentTickets] = useState([])

  useEffect(() => {
    fetchOrders()
    loadRecentTickets()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await getAssignedOrders()
      setOrders(response.orders || [])
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    }
  }

  const loadRecentTickets = () => {
    const savedTickets = localStorage.getItem('delivery_support_tickets')
    if (savedTickets) {
      setRecentTickets(JSON.parse(savedTickets))
    }
  }

  const saveTicket = (ticket) => {
    const updatedTickets = [ticket, ...recentTickets].slice(0, 5)
    setRecentTickets(updatedTickets)
    localStorage.setItem('delivery_support_tickets', JSON.stringify(updatedTickets))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.subject.trim()) {
      toast.error('Please enter a subject')
      return
    }
    if (!formData.message.trim()) {
      toast.error('Please enter your message')
      return
    }

    setLoading(true)
    try {
      const response = await raiseSupport(
        formData.subject,
        formData.message,
        formData.orderId || null
      )
      
      const newTicket = {
        id: response.ticket?._id || Date.now(),
        subject: formData.subject,
        message: formData.message,
        orderId: formData.orderId,
        status: 'open',
        createdAt: new Date().toISOString(),
        reply: null
      }
      saveTicket(newTicket)
      
      toast.success('Support ticket raised successfully')
      setFormData({ subject: '', message: '', orderId: '' })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to raise support ticket')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusColors = {
      open: '#ffc107',
      in_progress: '#17a2b8',
      resolved: '#28a745',
      closed: '#6c757d'
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

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="delivery-support">
      <div className="support-header">
        <h1>Support Center</h1>
        <p>Need help? Raise a ticket and our team will assist you</p>
      </div>

      <div className="support-grid">
        {/* Raise Ticket Form */}
        <div className="support-card">
          <h2>Raise New Ticket</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Subject *</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="e.g., Payment Issue, Delivery Delay, App Problem"
                required
              />
            </div>

            <div className="form-group">
              <label>Related Order (Optional)</label>
              <select
                value={formData.orderId}
                onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
              >
                <option value="">Select an order (optional)</option>
                {orders.map((order) => (
                  <option key={order._id} value={order._id}>
                    {order.orderId} - ₹{order.finalAmount}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Message *</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows="5"
                placeholder="Describe your issue in detail..."
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Ticket'}
            </button>
          </form>
        </div>

        {/* Recent Tickets */}
        <div className="support-card">
          <h2>Recent Tickets</h2>
          {recentTickets.length === 0 ? (
            <div className="no-tickets">
              <p>No support tickets yet</p>
              <p className="sub-text">Your tickets will appear here</p>
            </div>
          ) : (
            <div className="tickets-list">
              {recentTickets.map((ticket) => (
                <div className="ticket-item" key={ticket.id}>
                  <div className="ticket-header">
                    <span className="ticket-subject">{ticket.subject}</span>
                    <span style={getStatusBadge(ticket.status)}>
                      {ticket.status}
                    </span>
                  </div>
                  <div className="ticket-message">
                    {ticket.message.substring(0, 100)}
                    {ticket.message.length > 100 && '...'}
                  </div>
                  {ticket.orderId && (
                    <div className="ticket-order">
                      Order ID: {ticket.orderId}
                    </div>
                  )}
                  <div className="ticket-footer">
                    <span className="ticket-date">{formatDate(ticket.createdAt)}</span>
                  </div>
                  {ticket.reply && (
                    <div className="ticket-reply">
                      <strong>Reply:</strong> {ticket.reply}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="support-info">
        <div className="info-card">
          <h3>📞 Contact Support</h3>
          <p>Email: support@foodiedash.com</p>
          <p>Phone: +91 98765 43210</p>
          <p>Hours: Mon-Sat, 9 AM - 8 PM</p>
        </div>
        <div className="info-card">
          <h3>⏱️ Response Time</h3>
          <p>Standard tickets: 24-48 hours</p>
          <p>Urgent issues: 4-6 hours</p>
          <p>Critical issues: 1-2 hours</p>
        </div>
        <div className="info-card">
          <h3>📝 Before Submitting</h3>
          <p>✓ Check our FAQ section</p>
          <p>✓ Include order ID if relevant</p>
          <p>✓ Add screenshots if possible</p>
        </div>
      </div>
    </div>
  )
}

export default Support