import React, { useState, useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { getAvailability, goOnline, goOffline } from '../../services/delivery'
import toast from 'react-hot-toast'
import '../../styles/delivery/DeliveryLayout.css'

const DeliveryLayout = () => {
    const { user, logout } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [isOnline, setIsOnline] = useState(false)
    const [showStatusMenu, setShowStatusMenu] = useState(false)

    useEffect(() => {
        fetchStatus()
        const interval = setInterval(fetchStatus, 60000)
        return () => clearInterval(interval)
    }, [])

    const fetchStatus = async () => {
        try {
            const availability = await getAvailability()
            setIsOnline(availability.isOnline || false)
        } catch (error) {
            console.error('Failed to fetch status:', error)
        }
    }

    const handleStatusToggle = async () => {
        try {
            if (isOnline) {
                await goOffline()
                toast.success('You are now offline')
                setIsOnline(false)
            } else {
                await goOnline()
                toast.success('You are now online and ready to accept deliveries')
                setIsOnline(true)
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to change status')
        }
    }

    const handleLogout = () => {
        logout()
        toast.success('Logged out successfully')
        navigate('/login')
    }

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen)
    }

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen)
    }

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 768) {
                setMobileMenuOpen(false)
            }
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const menuItems = [
        { path: '/delivery', label: 'Dashboard', icon: '📊' },
        { path: '/delivery/orders', label: 'Orders', icon: '📦' },
        { path: '/delivery/history', label: 'History', icon: '📋' },
        { path: '/delivery/earnings', label: 'Earnings', icon: '💰' },
        { path: '/delivery/profile', label: 'Profile', icon: '👤' },
        { path: '/delivery/support', label: 'Support', icon: '💬' },
    ]

    const isActive = (path) => {
        if (path === '/delivery' && location.pathname === '/delivery') return true
        if (path !== '/delivery' && location.pathname.startsWith(path)) return true
        return false
    }

    return (
        <div className="delivery-app">
            {mobileMenuOpen && <div className="mobile-overlay" onClick={toggleMobileMenu}></div>}

            <aside className={`delivery-sidebar ${!sidebarOpen ? 'collapsed' : ''} ${mobileMenuOpen ? 'mobile-open' : ''}`}>
                <div className="sidebar-brand">
                    <div className="brand-icon">🚚</div>
                    {sidebarOpen && <div className="brand-name">FoodieDash</div>}
                    {sidebarOpen && <div className="brand-badge">Delivery</div>}
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            {sidebarOpen && <span className="nav-label">{item.label}</span>}
                            {isActive(item.path) && <span className="active-indicator"></span>}
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="status-indicator">
                        <button 
                            className={`status-toggle-btn ${isOnline ? 'online' : 'offline'}`}
                            onClick={handleStatusToggle}
                        >
                            <span className="status-dot"></span>
                            {sidebarOpen && (isOnline ? 'Online' : 'Offline')}
                        </button>
                    </div>
                    <button onClick={handleLogout} className="logout-btn">
                        <span className="nav-icon">🚪</span>
                        {sidebarOpen && <span className="nav-label">Logout</span>}
                    </button>
                </div>
            </aside>

            <main className={`delivery-main ${!sidebarOpen ? 'sidebar-collapsed' : ''}`}>
                <header className="delivery-header">
                    <div className="header-left">
                        <button className="menu-toggle" onClick={toggleSidebar}>☰</button>
                        <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>☰</button>
                    </div>
                    <div className="header-actions">
                        <div className={`online-status-badge ${isOnline ? 'online' : 'offline'}`}>
                            <span className="status-dot"></span>
                            {isOnline ? 'Online' : 'Offline'}
                        </div>
                        <div className="user-menu">
                            <span>{user?.name?.split(' ')[0]}</span>
                            <div className="user-avatar small">{user?.name?.charAt(0) || 'D'}</div>
                        </div>
                    </div>
                </header>

                <Outlet />
            </main>
        </div>
    )
}

export default DeliveryLayout