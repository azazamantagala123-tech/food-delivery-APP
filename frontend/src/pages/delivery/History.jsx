import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getDeliveryHistory } from '../../services/delivery'
import toast from 'react-hot-toast'
import '../../styles/delivery/History.css'

const History = () => {
  const { user } = useAuth()
  const [deliveries, setDeliveries] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalDeliveries, setTotalDeliveries] = useState(0)
  const [statusFilter, setStatusFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchHistory()
  }, [page, statusFilter])

  const fetchHistory = async () => {
    setLoading(true)
    try {
      const response = await getDeliveryHistory(page, 10)
      let deliveriesList = response.deliveries || []
      
      // Apply search filter
      if (searchTerm) {
        deliveriesList = deliveriesList.filter(d => 
          d.orderId?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }
      
      setDeliveries(deliveriesList)
      setTotalPages(response.totalPages || 1)
      setTotalDeliveries(response.totalDeliveries || 0)
    } catch (error) {
      console.error('Failed to fetch delivery history:', error)
      toast.error('Failed to load delivery history')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusColors = {
      delivered: '#28a745',
      cancelled: '#dc3545',
      returned: '#ffc107',
      pending: '#17a2b8'
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

  if (loading) {
    return <div className="loading">Loading delivery history...</div>
  }

  return (
    <div className="delivery-history">
      <div className="history-header">
        <h1>Delivery History</h1>
        <p>Total Deliveries: {totalDeliveries}</p>
      </div>

      <div className="history-filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Search by Order ID..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setTimeout(() => fetchHistory(), 500)
            }}
            className="search-input"
          />
        </div>
        <div className="filter-group">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="returned">Returned</option>
          </select>
        </div>
        <button className="btn-primary" onClick={fetchHistory}>Apply Filters</button>
      </div>

      <div className="history-table-container">
        {deliveries.length === 0 ? (
          <div className="no-data">No delivery history found</div>
        ) : (
          <table className="history-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Address</th>
                <th>Amount</th>
                <th>Commission</th>
                <th>Status</th>
                <th>Delivered At</th>
               </tr>
            </thead>
            <tbody>
              {deliveries.map((delivery, index) => (
                <tr key={index}>
                  <td>
                    <span className="order-id-link">
                      {delivery.orderId}
                    </span>
                   </td>
                  <td>{formatDate(delivery.date)}</td>
                  <td>{delivery.customerName || '-'}</td>
                  <td>{delivery.address?.substring(0, 50)}...</td>
                  <td>₹{delivery.totalAmount?.toLocaleString() || 0}</td>
                  <td>₹{delivery.commission?.toLocaleString() || 0}</td>
                  <td>
                    <span style={getStatusBadge(delivery.status)}>
                      {delivery.status || 'Delivered'}
                    </span>
                   </td>
                  <td>{formatDate(delivery.deliveredAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="page-btn"
          >
            Previous
          </button>
          <span className="page-info">Page {page} of {totalPages}</span>
          <button 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="page-btn"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default History