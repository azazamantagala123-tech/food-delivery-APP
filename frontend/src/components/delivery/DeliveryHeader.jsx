import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import './DeliveryHeader.css'

const DeliveryHeader = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Online/Offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.user-menu-container')) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const formatDate = () => {
    return currentTime.toLocaleDateString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = () => {
    return currentTime.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const navItems = [
    { path: '/delivery', label: 'Dashboard', icon: '📊' },
    { path: '/delivery/orders', label: 'Orders', icon: '📦' },
    { path: '/delivery/history', label: 'History', icon: '📋' },
    { path: '/delivery/earnings', label: 'Earnings', icon: '💰' },
    { path: '/delivery/profile', label: 'Profile', icon: '👤' },
    { path: '/delivery/support', label: 'Support', icon: '💬' }
  ]

  const isActive = (path) => {
    if (path === '/delivery' && location.pathname === '/delivery') return true
    if (path !== '/delivery' && location.pathname.startsWith(path)) return true
    return false
  }

  const getOnlineStatus = () => {
    if (!isOnline) return { class: 'offline', text: '🔴 Offline', icon: '🔴' }
    return { class: 'online', text: '🟢 Online', icon: '🟢' }
  }

  const onlineStatus = getOnlineStatus()

  return (
    <header className="delivery-header">
      <div className="delivery-header-top">
        <div className="container">
          <div className="header-top-content">
            <div className="date-time">
              <span className="date">📅 {formatDate()}</span>
              <span className="time">⏰ {formatTime()}</span>
            </div>
            <div className="online-status-badge">
              <span className={`status-dot ${onlineStatus.class}`}></span>
              <span>{onlineStatus.text}</span>
            </div>
            <div className="header-actions">
              <div className="user-menu-container">
                <button 
                  className="user-menu-btn"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <div className="user-avatar">
                    {user?.name?.charAt(0) || 'D'}
                  </div>
                  <span className="user-name">{user?.name?.split(' ')[0] || 'Delivery'}</span>
                  <span className="dropdown-icon">▼</span>
                </button>
                {showUserMenu && (
                  <div className="user-dropdown">
                    <div className="user-info">
                      <div className="user-avatar-large">
                        {user?.name?.charAt(0) || 'D'}
                      </div>
                      <div className="user-details">
                        <strong>{user?.name}</strong>
                        <span>{user?.email}</span>
                        <span className="user-role">Delivery Partner</span>
                      </div>
                    </div>
                    <div className="dropdown-divider"></div>
                    <Link to="/delivery/profile" className="dropdown-item">
                      <span className="dropdown-icon">👤</span>
                      Profile Settings
                    </Link>
                    <Link to="/delivery/support" className="dropdown-item">
                      <span className="dropdown-icon">💬</span>
                      Support
                    </Link>
                    <div className="dropdown-divider"></div>
                    <button onClick={handleLogout} className="dropdown-item logout">
                      <span className="dropdown-icon">🚪</span>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="delivery-header-bottom">
        <div className="container">
          <div className="header-bottom-content">
            <Link to="/delivery" className="logo">
              <span className="logo-icon">🚚</span>
              <span className="logo-text">FoodieDash</span>
              <span className="logo-badge">Delivery</span>
            </Link>

            <button 
              className="mobile-menu-toggle"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              ☰
            </button>

            <nav className={`delivery-nav ${showMobileMenu ? 'mobile-open' : ''}`}>
              <ul className="nav-list">
                {navItems.map((item) => (
                  <li key={item.path} className="nav-item">
                    <Link 
                      to={item.path} 
                      className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <span className="nav-icon">{item.icon}</span>
                      <span className="nav-label">{item.label}</span>
                      {isActive(item.path) && <span className="active-indicator"></span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </header>
  )
}

export default DeliveryHeader