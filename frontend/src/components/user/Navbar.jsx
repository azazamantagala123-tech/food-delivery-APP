import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useCart } from '../../contexts/CartContext'
import toast from 'react-hot-toast'

const UserNavbar = () => {
  const { user, logout } = useAuth()
  const { itemCount } = useCart()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      background: '#15151e',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
      padding: '0 24px',
      height: '70px',
      display: 'flex',
      alignItems: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{
        maxWidth: '1400px',
        width: '100%',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {/* Logo */}
        <Link to="/home" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '22px',
          fontWeight: 'bold',
          textDecoration: 'none',
          color: '#f0eff8'
        }}>
          <span style={{ fontSize: '28px' }}>🍕</span>
          <span style={{ 
            background: 'linear-gradient(135deg, #ff6b2b, #ffc849)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>FoodieDash</span>
        </Link>

        {/* Navigation Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Link to="/home" style={{
            textDecoration: 'none',
            color: isActive('/home') ? '#ff6b2b' : '#9997b3',
            fontWeight: '500',
            transition: 'color 0.3s'
          }}>Home</Link>
          
          <Link to="/orders" style={{
            textDecoration: 'none',
            color: isActive('/orders') ? '#ff6b2b' : '#9997b3',
            fontWeight: '500'
          }}>Orders</Link>
          
          <Link to="/favorites" style={{
            textDecoration: 'none',
            color: isActive('/favorites') ? '#ff6b2b' : '#9997b3',
            fontWeight: '500'
          }}>Favorites</Link>
          
          <Link to="/wallet" style={{
            textDecoration: 'none',
            color: isActive('/wallet') ? '#ff6b2b' : '#9997b3',
            fontWeight: '500'
          }}>Wallet</Link>

          {/* Cart */}
          <Link to="/cart" style={{
            position: 'relative',
            textDecoration: 'none',
            fontSize: '22px',
            color: '#f0eff8'
          }}>
            🛒
            {itemCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-12px',
                background: '#ff6b2b',
                color: 'white',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                fontSize: '11px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>{itemCount}</span>
            )}
          </Link>

          {/* Profile */}
          <Link to="/profile" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textDecoration: 'none',
            color: '#f0eff8'
          }}>
            <span style={{
              width: '32px',
              height: '32px',
              background: '#ff6b2b',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold'
            }}>
              {user?.name?.charAt(0) || 'U'}
            </span>
            <span style={{ color: '#9997b3' }}>{user?.name?.split(' ')[0]}</span>
          </Link>

          {/* Logout Button */}
          <button onClick={handleLogout} style={{
            background: 'transparent',
            border: '1px solid rgba(255,107,43,0.3)',
            color: '#ff6b2b',
            padding: '8px 16px',
            borderRadius: '30px',
            cursor: 'pointer',
            fontWeight: '500'
          }}>
            🚪 Logout
          </button>
        </div>
      </div>
    </nav>
  )
}

export default UserNavbar