import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import './DeliverySidebar.css'

const DeliverySidebar = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [openSubmenus, setOpenSubmenus] = useState({})

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  const toggleSubmenu = (menuName) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }))
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const isActive = (path) => {
    if (path === '/delivery' && location.pathname === '/delivery') return true
    if (path !== '/delivery' && location.pathname.startsWith(path)) return true
    return false
  }

  const navItems = [
    {
      path: '/delivery',
      label: 'Dashboard',
      icon: '📊',
      exact: true
    },
    {
      label: 'Order Management',
      icon: '📦',
      submenu: [
        { path: '/delivery/orders', label: 'Active Orders', icon: '🔄' },
        { path: '/delivery/history', label: 'Order History', icon: '📋' }
      ]
    },
    {
      label: 'Earnings',
      icon: '💰',
      submenu: [
        { path: '/delivery/earnings', label: 'My Earnings', icon: '📈' },
        { path: '/delivery/wallet', label: 'Wallet', icon: '👛' },
        { path: '/delivery/withdraw', label: 'Withdraw', icon: '💸' }
      ]
    },
    {
      path: '/delivery/profile',
      label: 'My Profile',
      icon: '👤'
    },
    {
      label: 'Support',
      icon: '💬',
      submenu: [
        { path: '/delivery/support', label: 'Raise Ticket', icon: '🎫' },
        { path: '/delivery/faq', label: 'FAQ', icon: '❓' }
      ]
    }
  ]

  const quickStats = [
    { label: 'Today\'s Earnings', value: '₹450', icon: '💰', color: '#28a745' },
    { label: 'Today\'s Orders', value: '6', icon: '📦', color: '#ff6b35' },
    { label: 'Rating', value: '4.8', icon: '⭐', color: '#ffc107' },
    { label: 'Online Time', value: '6h 30m', icon: '⏱️', color: '#17a2b8' }
  ]

  return (
    <div className={`delivery-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="logo-area">
          <span className="logo-icon">🚚</span>
          {!isCollapsed && <span className="logo-text">FoodieDash</span>}
        </div>
        <button className="toggle-btn" onClick={toggleSidebar}>
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      <div className="user-info">
        <div className="user-avatar">
          {user?.name?.charAt(0) || 'D'}
        </div>
        {!isCollapsed && (
          <div className="user-details">
            <strong>{user?.name}</strong>
            <span>Delivery Partner</span>
            <div className="online-status">
              <span className="status-dot online"></span>
              Online
            </div>
          </div>
        )}
      </div>

      {!isCollapsed && (
        <div className="quick-stats">
          <h4>Quick Stats</h4>
          <div className="stats-grid">
            {quickStats.map((stat, index) => (
              <div className="stat-item" key={index}>
                <div className="stat-icon" style={{ background: stat.color }}>
                  {stat.icon}
                </div>
                <div className="stat-info">
                  <span className="stat-value">{stat.value}</span>
                  <span className="stat-label">{stat.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <nav className="sidebar-nav">
        <ul className="nav-list">
          {navItems.map((item, index) => (
            <li key={index} className="nav-item">
              {item.submenu ? (
                <>
                  <div 
                    className={`nav-link submenu-toggle ${openSubmenus[item.label] ? 'open' : ''}`}
                    onClick={() => toggleSubmenu(item.label)}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    {!isCollapsed && (
                      <>
                        <span className="nav-label">{item.label}</span>
                        <span className="submenu-arrow">▼</span>
                      </>
                    )}
                  </div>
                  {!isCollapsed && openSubmenus[item.label] && (
                    <ul className="submenu">
                      {item.submenu.map((subItem, subIndex) => (
                        <li key={subIndex}>
                          <Link 
                            to={subItem.path} 
                            className={`submenu-link ${isActive(subItem.path) ? 'active' : ''}`}
                          >
                            <span className="submenu-icon">{subItem.icon}</span>
                            <span className="submenu-label">{subItem.label}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <Link 
                  to={item.path} 
                  className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {!isCollapsed && <span className="nav-label">{item.label}</span>}
                  {isActive(item.path) && <span className="active-indicator"></span>}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="online-toggle">
          <button className="online-btn">
            <span className="status-dot online"></span>
            {!isCollapsed && <span>Go Online</span>}
          </button>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <span className="nav-icon">🚪</span>
          {!isCollapsed && <span className="nav-label">Logout</span>}
        </button>
      </div>
    </div>
  )
}

export default DeliverySidebar