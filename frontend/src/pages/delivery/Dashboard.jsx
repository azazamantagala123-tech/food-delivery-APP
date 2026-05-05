import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { 
  getAssignedOrders, 
  getWallet, 
  getEarnings,
  getRatings,
  goOnline,
  goOffline,
  setBreak,
  getAvailability,
  updateLocation
} from '../../services/delivery'
import toast from 'react-hot-toast'
import '../../styles/delivery/Dashboard.css'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [wallet, setWallet] = useState(null)
  const [earnings, setEarnings] = useState(null)
  const [ratings, setRatings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showOrdersDropdown, setShowOrdersDropdown] = useState(false)
  const [isOnline, setIsOnline] = useState(false)
  const [isOnBreak, setIsOnBreak] = useState(false)
  const dropdownRef = useRef(null)

  // Get user's current location
  const updateCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          try {
            await updateLocation(latitude, longitude)
            console.log('Location updated successfully')
          } catch (error) {
            console.error('Failed to update location:', error)
          }
        },
        (error) => {
          console.error('Geolocation error:', error)
        },
        { enableHighAccuracy: true }
      )
    }
  }

  useEffect(() => {
    updateCurrentLocation()
    fetchDashboardData()
    fetchAvailabilityStatus()
    
    // Update location every 30 seconds
    const locationInterval = setInterval(updateCurrentLocation, 30000)
    // Refresh data every 30 seconds
    const dataInterval = setInterval(fetchDashboardData, 30000)
    
    return () => {
      clearInterval(locationInterval)
      clearInterval(dataInterval)
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowOrdersDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchAvailabilityStatus = async () => {
    try {
      const availability = await getAvailability()
      setIsOnline(availability.isOnline || false)
      setIsOnBreak(availability.isOnBreak || false)
    } catch (error) {
      console.error('Failed to fetch availability:', error)
    }
  }

  const fetchDashboardData = async () => {
    try {
      const [ordersRes, walletRes, earningsRes, ratingsRes] = await Promise.all([
        getAssignedOrders(),
        getWallet(),
        getEarnings('today'),
        getRatings()
      ])
      setOrders(ordersRes.orders || [])
      setWallet(walletRes.wallet)
      setEarnings(earningsRes)
      setRatings(ratingsRes)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleGoOnline = async () => {
    try {
      await goOnline()
      setIsOnline(true)
      toast.success('You are now online')
      fetchAvailabilityStatus()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to go online')
    }
  }

  const handleGoOffline = async () => {
    try {
      await goOffline()
      setIsOnline(false)
      toast.success('You are now offline')
      fetchAvailabilityStatus()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to go offline')
    }
  }

  const handleBreak = async () => {
    try {
      if (isOnBreak) {
        await setBreak('end')
        toast.success('Break ended')
      } else {
        await setBreak('start')
        toast.success('Break started')
      }
      fetchAvailabilityStatus()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to toggle break')
    }
  }

  const getStatusBadge = (status) => {
    const colors = {
      pending: '#fef3c7', confirmed: '#dbeafe', preparing: '#fed7aa',
      ready: '#e9d5ff', assigned: '#d1fae5', accepted: '#a7f3d0',
      picked_up: '#bfdbfe', out_for_delivery: '#fbcfe8',
      delivered: '#d1fae5', cancelled: '#fee2e2'
    }
    const textColors = {
      pending: '#d97706', confirmed: '#2563eb', preparing: '#ea580c',
      ready: '#7c3aed', assigned: '#059669', accepted: '#047857',
      picked_up: '#1d4ed8', out_for_delivery: '#db2777',
      delivered: '#059669', cancelled: '#dc2626'
    }
    return { 
      backgroundColor: colors[status] || '#f1f5f9', 
      color: textColors[status] || '#64748b', 
      padding: '4px 12px', 
      borderRadius: '20px', 
      fontSize: '11px',
      fontWeight: '600'
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  // Helper function to safely format rating
  const getFormattedRating = () => {
    if (!ratings?.averageRating) return '5.0'
    const rating = typeof ratings.averageRating === 'number' ? ratings.averageRating : parseFloat(ratings.averageRating)
    return isNaN(rating) ? '5.0' : rating.toFixed(1)
  }

  // Helper function to get total ratings count
  const getTotalRatingsCount = () => {
    if (!ratings?.totalRatings) return 0
    return typeof ratings.totalRatings === 'number' ? ratings.totalRatings : parseInt(ratings.totalRatings) || 0
  }

  if (loading) return <div className="loading">Loading dashboard...</div>

  const activeOrdersCount = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length

  return (
    <div>
      {/* Header Section */}
      <div className="dashboard-header-wrapper">
        <div className="dashboard-header-left">
          <h1 className="dashboard-title">Delivery Dashboard</h1>
          <p className="dashboard-subtitle">Welcome back, {user?.name || 'Delivery Partner'}! 👋</p>
        </div>
        
        <div className="dashboard-header-right">
          {/* Online Status */}
          <div className="status-controls">
            <button 
              className={`status-btn ${isOnline ? 'online' : 'offline'}`}
              onClick={isOnline ? handleGoOffline : handleGoOnline}
            >
              <span className="status-dot"></span>
              {isOnline ? (isOnBreak ? 'On Break' : 'Online') : 'Offline'}
            </button>
            {isOnline && (
              <button className="break-btn" onClick={handleBreak}>
                {isOnBreak ? 'End Break' : 'Take Break'}
              </button>
            )}
          </div>

          {/* Assigned Orders Dropdown */}
          <div className="orders-dropdown" ref={dropdownRef}>
            <button 
              className="orders-dropdown-btn"
              onClick={() => setShowOrdersDropdown(!showOrdersDropdown)}
            >
              <span className="dropdown-icon">📦</span>
              <span className="dropdown-text">Assigned Orders</span>
              {activeOrdersCount > 0 && (
                <span className="notification-badge">{activeOrdersCount}</span>
              )}
              <span className="dropdown-arrow">{showOrdersDropdown ? '▲' : '▼'}</span>
            </button>
            
            {showOrdersDropdown && (
              <div className="orders-dropdown-menu">
                <div className="dropdown-header">
                  <h3>Your Assigned Orders</h3>
                  <Link to="/delivery/orders" className="view-all-link">View All</Link>
                </div>
                <div className="dropdown-orders-list">
                  {orders.length === 0 ? (
                    <div className="no-orders-dropdown">
                      <span>🎉</span>
                      <p>No assigned orders</p>
                    </div>
                  ) : (
                    orders.map(order => (
                      <Link 
                        to={`/delivery/orders/${order._id}`} 
                        key={order._id}
                        className="dropdown-order-item"
                      >
                        <div className="dropdown-order-info">
                          <span className="dropdown-order-id">{order.orderId}</span>
                          <span className="dropdown-order-amount">₹{order.finalAmount}</span>
                        </div>
                        <div className="dropdown-order-footer">
                          <span style={getStatusBadge(order.status)} className="status-badge-small">
                            {order.status?.replace(/_/g, ' ')}
                          </span>
                          <span className="dropdown-order-location">
                            📍 {order.deliveryAddress?.area || order.address?.substring(0, 30) || 'Address available'}
                          </span>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Notification Icons */}
          <div className="header-actions">
            <button className="header-icon-btn" title="Notifications">
              <span className="icon">🔔</span>
              {activeOrdersCount > 0 && <span className="icon-badge">{activeOrdersCount}</span>}
            </button>
            <div className="user-menu">
              <button className="user-menu-btn">
                <div className="user-avatar-small">
                  {user?.name?.charAt(0) || 'D'}
                </div>
                <span className="user-name">{user?.name?.split(' ')[0] || 'Partner'}</span>
              </button>
            </div>
            <button onClick={handleLogout} className="logout-header-btn" title="Logout">
              <span className="icon">🚪</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-icon blue">📦</div>
          <div className="stat-info">
            <h3>{activeOrdersCount}</h3>
            <p>Active Orders</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">💰</div>
          <div className="stat-info">
            <h3>₹{wallet?.balance?.toLocaleString() || 0}</h3>
            <p>Wallet Balance</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">🏆</div>
          <div className="stat-info">
            <h3>₹{earnings?.totalEarnings?.toLocaleString() || 0}</h3>
            <p>Today's Earnings</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">⭐</div>
          <div className="stat-info">
            <h3>{getFormattedRating()}</h3>
            <p>Rating ({getTotalRatingsCount()} reviews)</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <div className="section-header">
          <h2>Quick Actions</h2>
        </div>
        <div className="actions-grid">
          <Link to="/delivery/orders" className="action-card">
            <div className="action-icon">📋</div>
            <h4>View Orders</h4>
            <p>Check your assigned orders</p>
          </Link>
          <Link to="/delivery/earnings" className="action-card">
            <div className="action-icon">💰</div>
            <h4>Withdraw</h4>
            <p>Withdraw your earnings</p>
          </Link>
          <Link to="/delivery/profile" className="action-card">
            <div className="action-icon">⚙️</div>
            <h4>Profile</h4>
            <p>Update your profile</p>
          </Link>
          <Link to="/delivery/support" className="action-card">
            <div className="action-icon">💬</div>
            <h4>Support</h4>
            <p>Get help 24/7</p>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Dashboard