import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useCart } from '../../contexts/CartContext'
import toast from 'react-hot-toast'
import './Navbar.css'

const UserNavbar = () => {
  const { user, logout } = useAuth()
  const { itemCount } = useCart()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  return (
    <nav className="user-navbar">
      <div className="container">
        <Link to="/home" className="logo">
          <span className="logo-icon">🍕</span>
          FoodieDash
        </Link>
        
        <div className="nav-links">
          <Link to="/home">Home</Link>
          <Link to="/orders">Orders</Link>
          <Link to="/favorites">Favorites</Link>
          <Link to="/wallet">Wallet</Link>
          <Link to="/profile" className="profile-link">
            <span className="user-avatar-small">
              {user?.name?.charAt(0) || 'U'}
            </span>
            <span className="user-name">{user?.name?.split(' ')[0]}</span>
          </Link>
          <Link to="/cart" className="cart-link">
            🛒 
            {itemCount > 0 && <span className="cart-count">{itemCount}</span>}
          </Link>
          <button onClick={handleLogout} className="logout-btn">
            🚪 Logout
          </button>
        </div>
      </div>
    </nav>
  )
}

export default UserNavbar