import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { getUserOrders } from '../../services/order'
import { getWallet } from '../../services/auth'
import toast from 'react-hot-toast'
import '../../styles/user/Dashboard.css'

// ── Reveal Hook ──────────────────────────────────────────────
const useReveal = () => {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) el.classList.add('visible') },
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return ref
}

// ── Status Badge ─────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    pending: 'status-pending',
    confirmed: 'status-confirmed',
    preparing: 'status-preparing',
    out_for_delivery: 'status-out_for_delivery',
    delivered: 'status-delivered',
    cancelled: 'status-cancelled',
  }
  return (
    <span className={`status-badge ${map[status] || 'status-default'}`}>
      {status?.replace(/_/g, ' ')}
    </span>
  )
}

// ── Quick Links ──────────────────────────────────────────────
const QUICK_LINKS = [
  { icon: '👤', label: 'My Profile',  path: '/profile' },
  { icon: '📦', label: 'All Orders',  path: '/orders' },
  { icon: '❤️', label: 'Favourites',  path: '/favorites' },
  { icon: '👛', label: 'Wallet',      path: '/wallet' },
]

// ── Main Component ───────────────────────────────────────────
const Dashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [orders,  setOrders]  = useState([])
  const [wallet,  setWallet]  = useState(null)
  const [loading, setLoading] = useState(true)
  const [stats,   setStats]   = useState({ total: 0, spent: 0, active: 0, delivered: 0 })

  const headerRef = useReveal()
  const statsRef  = useReveal()
  const mainRef   = useReveal()

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [ordersRes, walletRes] = await Promise.all([
        getUserOrders(),
        getWallet(),
      ])
      const all = ordersRes.orders || []
      setOrders(all.slice(0, 5))
      setWallet(walletRes.wallet)
      setStats({
        total:     all.length,
        spent:     all.reduce((s, o) => s + (o.finalAmount || 0), 0),
        active:    all.filter(o => !['delivered','cancelled'].includes(o.status)).length,
        delivered: all.filter(o => o.status === 'delivered').length,
      })
    } catch (err) {
      console.error(err)
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Loading your dashboard…</p>
      </div>
    )
  }

  const STAT_CARDS = [
    { icon: '📦', value: stats.total,                         label: 'Total Orders' },
    { icon: '💰', value: `₹${stats.spent.toLocaleString()}`,  label: 'Total Spent' },
    { icon: '🔄', value: stats.active,                        label: 'Active Orders' },
    { icon: '✅', value: stats.delivered,                     label: 'Delivered' },
  ]

  return (
    <div className="user-dashboard">

      {/* ── Header ── */}
      <div className="dashboard-header reveal" ref={headerRef}>
        <div>
          <h1>Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
          <p>Here's what's happening with your orders today.</p>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="stats-grid reveal" ref={statsRef}>
        {STAT_CARDS.map((s, i) => (
          <div key={i} className={`stat-card reveal rd${i + 1}`}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-info">
              <h3>{s.value}</h3>
              <p>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main Content ── */}
      <div className="dashboard-sections reveal" ref={mainRef}>

        {/* Recent Orders */}
        <div className="section-card">
          <div className="section-card-header">
            <h2>Recent Orders</h2>
            <Link to="/orders">View all →</Link>
          </div>

          {orders.length === 0 ? (
            <div className="no-data">
              <div className="no-icon">📭</div>
              <h3>No orders yet</h3>
              <p>Your recent orders will show up here</p>
              <Link to="/" className="btn-start-shopping">Start Shopping</Link>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map((order) => (
                <div className="order-row" key={order._id}>
                  <div className="order-row-icon">🍽️</div>
                  <div className="order-row-info">
                    <span className="order-id">#{order.orderId}</span>
                    <span className="order-meta">
                      {order.items?.length || 0} items ·{' '}
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short',
                      })}
                    </span>
                  </div>
                  <div className="order-row-right">
                    <span className="order-amount">₹{order.finalAmount}</span>
                    <StatusBadge status={order.status} />
                    <br />
                    <button
                      className="btn-view-order"
                      onClick={() => navigate(`/orders/${order._id}`)}
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="sidebar-stack">

          {/* Wallet */}
          <div className="wallet-hero">
            <p className="wallet-hero-label">Wallet Balance</p>
            <div className="wallet-hero-amount">
              <span>₹</span>
              {wallet?.balance?.toLocaleString() || '0'}
            </div>
            <button className="btn-add-money" onClick={() => navigate('/wallet')}>
              + Add Money
            </button>
          </div>

          {/* Quick Links */}
          <div className="quick-links-card">
            <h3>Quick Links</h3>
            {QUICK_LINKS.map((link) => (
              <div
                key={link.path}
                className="quick-link-item"
                onClick={() => navigate(link.path)}
              >
                <span>
                  <span className="ql-icon">{link.icon}</span>{' '}
                  {link.label}
                </span>
                <span className="ql-arrow">›</span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}

export default Dashboard