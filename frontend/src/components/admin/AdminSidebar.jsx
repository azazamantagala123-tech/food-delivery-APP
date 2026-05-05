import React, { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'
import './AdminSidebar.css'

const AdminSidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [openSubmenus, setOpenSubmenus] = useState({})

  useEffect(() => {
    const saved = localStorage.getItem('adminSidebarCollapsed')
    if (saved !== null) setIsCollapsed(JSON.parse(saved))
  }, [])

  useEffect(() => {
    localStorage.setItem('adminSidebarCollapsed', JSON.stringify(isCollapsed))
  }, [isCollapsed])

  const toggleSubmenu = (name) => {
    setOpenSubmenus(prev => ({ ...prev, [name]: !prev[name] }))
  }

  // ✅ ALL NAVIGATION ITEMS - Using NavLink (No Page Reload)
  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: '📊' },
    {
      label: 'Restaurant',
      icon: '🍽️',
      submenu: [
        { path: '/admin/foods', label: 'Food Items', icon: '🍔' },
        { path: '/admin/categories', label: 'Categories', icon: '📁' }
      ]
    },
    {
      label: 'Orders',
      icon: '📦',
      submenu: [
        { path: '/admin/orders', label: 'All Orders', icon: '📋' }
      ]
    },
    {
      label: 'Users',
      icon: '👥',
      submenu: [
        { path: '/admin/users', label: 'All Users', icon: '👤' },
        { path: '/admin/delivery', label: 'Delivery Partners', icon: '🚚' }
      ]
    },
    { path: '/admin/coupons', label: 'Coupons', icon: '🎫' },
    { path: '/admin/reports', label: 'Reports', icon: '📊' },
    { path: '/admin/settings', label: 'Settings', icon: '⚙️' }
  ]

  return (
    <>
      <div className={`admin-sidebar-modern ${isCollapsed ? 'collapsed' : ''} ${isOpen ? 'mobile-open' : ''}`}>
        {/* Header */}
        <div className="sidebar-header-modern">
          <div className="logo-area">
            <span className="logo-icon">🍕</span>
            {!isCollapsed && <span className="logo-text">FoodieDash</span>}
          </div>
          <button className="collapse-btn" onClick={() => setIsCollapsed(!isCollapsed)}>
            {isCollapsed ? '→' : '←'}
          </button>
        </div>

        {/* User Profile */}
        <div className="sidebar-user-modern">
          <div className="user-avatar-modern">
            {user?.name?.charAt(0) || 'A'}
          </div>
          {!isCollapsed && (
            <div className="user-info-modern">
              <div className="user-name-modern">{user?.name || 'Admin User'}</div>
              <div className="user-role-modern">Administrator</div>
            </div>
          )}
        </div>

        {/* ✅ MAIN NAVIGATION - Using NavLink (NO PAGE RELOAD) */}
        <nav className="sidebar-nav-modern">
          <ul className="nav-list-modern">
            {navItems.map((item, idx) => (
              <li key={idx} className="nav-item-modern">
                {item.submenu ? (
                  <>
                    <div 
                      className={`nav-link-modern ${openSubmenus[item.label] ? 'open' : ''}`}
                      onClick={() => toggleSubmenu(item.label)}
                    >
                      <span className="nav-icon">{item.icon}</span>
                      {!isCollapsed && (
                        <>
                          <span className="nav-label">{item.label}</span>
                          <span className="nav-arrow">{openSubmenus[item.label] ? '▲' : '▼'}</span>
                        </>
                      )}
                    </div>
                    {!isCollapsed && openSubmenus[item.label] && (
                      <ul className="submenu-modern">
                        {item.submenu.map((sub, subIdx) => (
                          <li key={subIdx}>
                            <NavLink 
                              to={sub.path} 
                              className={({ isActive }) => `submenu-link-modern ${isActive ? 'active' : ''}`}
                              onClick={() => {
                                if (onClose) onClose()
                              }}
                            >
                              <span className="submenu-icon">{sub.icon}</span>
                              <span className="submenu-label">{sub.label}</span>
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <NavLink 
                    to={item.path} 
                    className={({ isActive }) => `nav-link-modern ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      if (onClose) onClose()
                    }}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    {!isCollapsed && <span className="nav-label">{item.label}</span>}
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Mobile Overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
    </>
  )
}

export default AdminSidebar