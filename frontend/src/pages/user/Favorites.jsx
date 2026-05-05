import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useCart } from '../../contexts/CartContext'
import { getFavorites, removeFavorite } from '../../services/auth'
import toast from 'react-hot-toast'
import '../../styles/user/Favourites.css'

const Favorites = () => {
  const { user } = useAuth()
  const { addItem } = useCart()
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [removingId, setRemovingId] = useState(null)
  const [addingToCartId, setAddingToCartId] = useState(null)
  const [hoveredCard, setHoveredCard] = useState(null)
  const [viewMode, setViewMode] = useState('grid')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchFavorites()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const fetchFavorites = useCallback(async () => {
    setLoading(true)
    try {
      const response = await getFavorites()
      setFavorites(response.favorites || [])
    } catch (error) {
      console.error('Failed to fetch favorites:', error)
      toast.error('Failed to load favorites')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleRemoveFavorite = useCallback(async (foodId, foodName) => {
    setRemovingId(foodId)
    try {
      await removeFavorite(foodId)
      toast.success(`${foodName} removed from favorites`, {
        icon: '💔',
        style: { background: '#000000', color: '#ffffff' }
      })
      setTimeout(() => {
        fetchFavorites()
        setRemovingId(null)
      }, 300)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove')
      setRemovingId(null)
    }
  }, [fetchFavorites])

  const handleAddToCart = useCallback(async (food) => {
    setAddingToCartId(food._id)
    try {
      const result = await addItem(food._id, 1)
      if (result.success) {
        toast.success(`${food.name} added to cart!`, {
          icon: '🛒',
          style: { background: '#000000', color: '#ffffff' }
        })
        const card = document.getElementById(`card-${food._id}`)
        if (card) {
          card.classList.add('cart-added')
          setTimeout(() => card.classList.remove('cart-added'), 500)
        }
      } else {
        toast.error(result.message || 'Failed to add item')
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setAddingToCartId(null)
    }
  }, [addItem])

  const getDiscountedPrice = useCallback((price, discount) => {
    return discount ? price - (price * discount / 100) : price
  }, [])

  const formatPrice = useCallback((price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }, [])

  const filteredFavorites = useMemo(() => {
    return favorites.filter(fav => {
      const food = fav.food
      if (!food) return false
      if (!searchTerm) return true
      return food.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             food.category?.toLowerCase().includes(searchTerm.toLowerCase())
    })
  }, [favorites, searchTerm])

  const memoizedFavorites = useMemo(() => {
    return filteredFavorites.filter(fav => fav.food)
  }, [filteredFavorites])

  if (loading) {
    return (
      <div className="favorites-loading">
        <div className="loading-spinner"></div>
        <p>Loading your favorites...</p>
      </div>
    )
  }

  return (
    <div className="favorites-page">
      {/* Animated Background */}
      <div className="animated-bg">
        <div className="gradient-sphere"></div>
        <div className="gradient-sphere-2"></div>
      </div>

      <div className="favorites-container">
        {/* Hero Section */}
        <div className="favorites-hero">
          <div className="hero-content">
            <div className="hero-icon-wrapper">
              <div className="hero-icon-pulse"></div>
              <div className="hero-icon">❤️</div>
            </div>
            <h1 className="hero-title">
              Saved <span className="gold-text">Favorites</span>
            </h1>
            <p className="hero-subtitle">Your personal collection of delicious moments</p>
            {memoizedFavorites.length > 0 && (
              <div className="hero-stats">
                <span className="stat-badge">
                  🍽️ {memoizedFavorites.length} {memoizedFavorites.length === 1 ? 'Item' : 'Items'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Favorites Content */}
        <div className="favorites-content">
          <div className="container">
            {memoizedFavorites.length === 0 ? (
              <div className="empty-state">
                <div className="empty-animation">
                  <div className="empty-heart">❤️</div>
                  <div className="empty-heart-pulse"></div>
                </div>
                <h2 className="empty-title">Your favorites list is empty</h2>
                <p className="empty-message">
                  Start adding your favorite dishes and they'll appear here instantly
                </p>
                <button className="empty-btn" onClick={() => window.location.href = '/'}>
                  <span>🍕</span>
                  Explore Menu
                </button>
              </div>
            ) : (
              <>
                {/* Stats Bar */}
                <div className="favorites-stats-bar">
                  <div className="stats-info">
                    <span className="stats-heart">❤️</span>
                    <span className="stats-text">
                      You have <strong>{memoizedFavorites.length}</strong> favorite 
                      {memoizedFavorites.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <div className="stats-controls">
                    <div className="search-box">
                      <span className="search-icon">🔍</span>
                      <input
                        type="text"
                        placeholder="Search favorites..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                      />
                      {searchTerm && (
                        <button className="clear-search" onClick={() => setSearchTerm('')}>✕</button>
                      )}
                    </div>
                    
                    <div className="view-toggle">
                      <button 
                        className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                        onClick={() => setViewMode('grid')}
                      >
                        ⊞ Grid
                      </button>
                      <button 
                        className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                        onClick={() => setViewMode('list')}
                      >
                        ≡ List
                      </button>
                    </div>
                    
                    <button 
                      className="clear-all-btn"
                      onClick={() => {
                        if (window.confirm('Remove all items from favorites?')) {
                          Promise.all(memoizedFavorites.map(fav => 
                            removeFavorite(fav.food._id)
                          )).then(() => {
                            toast.success('All favorites removed', {
                              icon: '🗑️',
                              style: { background: '#000000', color: '#ffffff' }
                            })
                            fetchFavorites()
                          })
                        }
                      }}
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                {/* Favorites Grid */}
                <div className={`favorites-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
                  {memoizedFavorites.map((fav, index) => {
                    const food = fav.food
                    const discountedPrice = getDiscountedPrice(food.price, food.discount)
                    const isRemoving = removingId === food._id
                    const isAdding = addingToCartId === food._id

                    return (
                      <div 
                        key={fav._id} 
                        id={`card-${food._id}`}
                        className={`favorite-card ${isRemoving ? 'removing' : ''} ${viewMode === 'list' ? 'list-mode' : ''}`}
                        style={{ animationDelay: `${index * 0.05}s` }}
                        onMouseEnter={() => setHoveredCard(food._id)}
                        onMouseLeave={() => setHoveredCard(null)}
                      >
                        {/* Image Section */}
                        <div className="card-image-section">
                          <div className="image-wrapper">
                            <img 
                              src={food.image || 'https://placehold.co/400x300/1a1a1a/ffffff?text=Food+Item'} 
                              alt={food.name}
                              loading="lazy"
                            />
                            <div className="image-overlay"></div>
                            
                            {/* Badges */}
                            <div className="badges-container">
                              {food.isVeg ? (
                                <span className="veg-badge">
                                  <span className="badge-dot veg"></span>
                                  Pure Veg
                                </span>
                              ) : (
                                <span className="nonveg-badge">
                                  <span className="badge-dot nonveg"></span>
                                  Non-Veg
                                </span>
                              )}
                              {food.discount > 0 && (
                                <span className="discount-badge">
                                  {food.discount}% OFF
                                </span>
                              )}
                            </div>

                            {/* Remove Button */}
                            <button 
                              className="remove-btn"
                              onClick={() => handleRemoveFavorite(food._id, food.name)}
                              disabled={isRemoving}
                            >
                              {isRemoving ? (
                                <span className="btn-spinner"></span>
                              ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M18 6L6 18M6 6l12 12"/>
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Content Section */}
                        <div className="card-content">
                          <div className="card-header">
                            <h3 className="food-title">{food.name}</h3>
                            <div className="rating-badge">
                              <span className="star-icon">⭐</span>
                              <span className="rating-value">{food.rating || '4.5'}</span>
                            </div>
                          </div>

                          <p className="food-description">
                            {food.description?.substring(0, 80) || 'Delicious food item prepared with fresh ingredients'}
                            {food.description?.length > 80 && '...'}
                          </p>

                          {/* Categories */}
                          <div className="food-meta">
                            {food.category && (
                              <span className="category-tag">
                                {food.category}
                              </span>
                            )}
                            {food.cuisine && (
                              <span className="cuisine-tag">
                                {food.cuisine}
                              </span>
                            )}
                          </div>

                          {/* Price Section */}
                          <div className="price-section">
                            {food.discount > 0 ? (
                              <div className="price-wrapper">
                                <span className="original-price">
                                  {formatPrice(food.price)}
                                </span>
                                <span className="discounted-price">
                                  {formatPrice(discountedPrice)}
                                </span>
                                <span className="saved-badge">
                                  Save {formatPrice(food.price - discountedPrice)}
                                </span>
                              </div>
                            ) : (
                              <span className="current-price">
                                {formatPrice(food.price)}
                              </span>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <button 
                            className={`add-to-cart-btn ${isAdding ? 'loading' : ''}`}
                            onClick={() => handleAddToCart(food)}
                            disabled={isAdding}
                          >
                            {isAdding ? (
                              <>
                                <span className="btn-spinner"></span>
                                Adding...
                              </>
                            ) : (
                              <>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <circle cx="9" cy="21" r="1"/>
                                  <circle cx="20" cy="21" r="1"/>
                                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                                </svg>
                                Add to Cart
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Favorites