import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'
import './AdminHeader.css'

const AdminHeader = ({ onMenuClick }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showUserMenu, setShowUserMenu] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = () => {
    return currentTime.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = () => {
    return currentTime.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    })
  }

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  return (
    <header className="admin-header-simple">
      <div className="header-left">
        <button className="menu-toggle" onClick={onMenuClick}>
          ☰
        </button>
        <div className="logo">
          <span className="logo-icon">🍕</span>
          <span className="logo-text">FoodieDash</span>
          <span className="logo-badge">Admin</span>
        </div>
      </div>

      <div className="header-center">
        <div className="date-time">
          <span className="date">📅 {formatDate()}</span>
          <span className="time">⏰ {formatTime()}</span>
        </div>
      </div>

      <div className="header-right">
        <div className="user-menu" onClick={() => setShowUserMenu(!showUserMenu)}>
          <div className="user-avatar">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <span className="user-name">{user?.name?.split(' ')[0] || 'Admin'}</span>
          <span className="dropdown-icon">▼</span>
        </div>

        {showUserMenu && (
          <div className="user-dropdown">
            <div className="user-info">
              <div className="user-avatar-large">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="user-details">
                <strong>{user?.name || 'Admin User'}</strong>
                <span>{user?.email || 'admin@foodiedash.com'}</span>
                <span className="user-role">Administrator</span>
              </div>
            </div>
            <div className="dropdown-divider"></div>
            <button onClick={handleLogout} className="dropdown-item logout">
              <span>🚪</span> Logout
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

export default AdminHeader