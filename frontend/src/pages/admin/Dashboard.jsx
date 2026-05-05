import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getAdminStats, getAnalytics } from '../../services/admin'
import toast from 'react-hot-toast'
import '../../styles/admin/admin.css'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    totalDeliveryBoys: 0,
    completedOrders: 0,
    cancelledOrders: 0
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('week')

  useEffect(() => {
    fetchData()
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [period])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [statsRes, analyticsRes] = await Promise.all([
        getAdminStats(),
        getAnalytics(period)
      ])
      
      // Handle stats response
      if (statsRes && statsRes.stats) {
        setStats(prevStats => ({
          ...prevStats,
          ...statsRes.stats,
          totalUsers: statsRes.stats.totalUsers || 0,
          totalOrders: statsRes.stats.totalOrders || 0,
          pendingOrders: statsRes.stats.pendingOrders || 0,
          totalRevenue: statsRes.stats.totalRevenue || 0,
          totalDeliveryBoys: statsRes.stats.totalDeliveryBoys || 0,
          completedOrders: statsRes.stats.completedOrders || 0,
          cancelledOrders: statsRes.stats.cancelledOrders || 0
        }))
      }
      
      // Handle analytics response
      if (analyticsRes && analyticsRes.recentOrders) {
        setRecentOrders(analyticsRes.recentOrders)
      }
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      toast.error(error.response?.data?.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const statsCards = [
    { 
      title: 'Total Users', 
      value: stats.totalUsers?.toLocaleString() || 0, 
      icon: '👥', 
      color: '#6366f1',
      bg: 'rgba(99, 102, 241, 0.1)'
    },
    { 
      title: 'Total Orders', 
      value: stats.totalOrders?.toLocaleString() || 0, 
      icon: '📦', 
      color: '#3b82f6',
      bg: 'rgba(59, 130, 246, 0.1)'
    },
    { 
      title: 'Pending Orders', 
      value: stats.pendingOrders?.toLocaleString() || 0, 
      icon: '⏳', 
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.1)'
    },
    { 
      title: 'Total Revenue', 
      value: `₹${(stats.totalRevenue || 0).toLocaleString()}`, 
      icon: '💰', 
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.1)'
    },
    { 
      title: 'Delivery Partners', 
      value: stats.totalDeliveryBoys?.toLocaleString() || 0, 
      icon: '🚚', 
      color: '#8b5cf6',
      bg: 'rgba(139, 92, 246, 0.1)'
    },
    { 
      title: 'Completed Orders', 
      value: stats.completedOrders?.toLocaleString() || 0, 
      icon: '✅', 
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.1)'
    }
  ]

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      confirmed: '#3b82f6',
      preparing: '#8b5cf6',
      ready: '#06b6d4',
      assigned: '#10b981',
      accepted: '#14b8a6',
      picked_up: '#6366f1',
      out_for_delivery: '#f97316',
      delivered: '#10b981',
      cancelled: '#ef4444'
    }
    return colors[status] || '#6b7280'
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Welcome back, {user?.name || 'Admin'}! 👋</h1>
          <p>Here's what's happening with your business today.</p>
        </div>
        <div className="period-selector">
          <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      <div className="stats-grid">
        {statsCards.map((stat, idx) => (
          <div className="stat-card" key={idx}>
            <div className="stat-icon" style={{ background: stat.bg, color: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-info">
              <h3>{stat.value}</h3>
              <p>{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="recent-orders-section">
        <div className="section-header">
          <h2>Recent Orders</h2>
          <button className="refresh-btn" onClick={fetchData}>
            🔄 Refresh
          </button>
        </div>
        <div className="orders-table-container">
          {recentOrders.length === 0 ? (
            <div className="no-data">
              <p>No orders found</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order._id}>
                    <td className="order-id">{order.orderId || order._id}</td>
                    <td>{order.userId?.name || order.customerName || 'N/A'}</td>
                    <td className="amount">₹{(order.finalAmount || order.totalAmount || 0).toLocaleString()}</td>
                    <td>
                      <span 
                        className="order-status-badge"
                        style={{ background: getStatusColor(order.status), color: '#fff' }}
                      >
                        {order.status?.replace(/_/g, ' ') || 'Pending'}
                      </span>
                    </td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard