import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../contexts/CartContext'
import {
  getAllFoods,
  getPopularFoods,
  getTrendingFoods,
  searchFoods,
} from '../../services/food'
import toast from 'react-hot-toast'
import '../../styles/user/Home.css'

// ==================== IMAGE URLs ====================
const FOOD_IMAGE_URLS = {
  pizza: 'https://tse1.mm.bing.net/th/id/OIP.2dhr5Ln6cMHIu9SmwE_uBgHaE7?rs=1&pid=ImgDetMain',
  burger: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
  biryani: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=400&h=300&fit=crop',
  pasta: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=400&h=300&fit=crop',
  salad: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
  dessert: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop',
  northIndian: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&h=300&fit=crop',
  southIndian: 'https://images.unsplash.com/photo-1630384060421-cf20c0e6cf5e?w=400&h=300&fit=crop',
  fastfood: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&h=300&fit=crop',
  beverages: 'https://images.unsplash.com/photo-1543253687-c931c8e01820?w=400&h=300&fit=crop',
  default: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
}

const CATEGORIES = [
  { id: 'all', label: 'All', emoji: '🍽️' },
  { id: 'Pizza', label: 'Pizza', emoji: '🍕' },
  { id: 'North Indian', label: 'North Indian', emoji: '🍛' },
  { id: 'Biryani', label: 'Biryani', emoji: '🍚' },
  { id: 'South Indian', label: 'South Indian', emoji: '🥘' },
  { id: 'Fast Food', label: 'Fast Food', emoji: '🍔' },
  { id: 'Dessert', label: 'Dessert', emoji: '🍰' },
  { id: 'Beverages', label: 'Beverages', emoji: '🥤' },
]

// ==================== FoodCard Component ====================
const FoodCard = ({ food, onAddToCart, delay = 0 }) => {
  const ref = useRef(null)
  const navigate = useNavigate()
  const [imgLoaded, setImgLoaded] = useState(false)
  const [isFav, setIsFav] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add('visible') },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const discountedPrice = food.discount
    ? Math.round(food.price - (food.price * food.discount) / 100)
    : food.price

  const getFoodImage = () => {
    const name = food.name?.toLowerCase() || ''
    const category = food.category?.toLowerCase() || ''
    if (name.includes('pizza') || category.includes('pizza')) return FOOD_IMAGE_URLS.pizza
    if (name.includes('burger') || category.includes('fast food')) return FOOD_IMAGE_URLS.burger
    if (name.includes('biryani') || category.includes('biryani')) return FOOD_IMAGE_URLS.biryani
    if (name.includes('pasta')) return FOOD_IMAGE_URLS.pasta
    if (name.includes('salad')) return FOOD_IMAGE_URLS.salad
    if (name.includes('dessert') || name.includes('cake') || category.includes('dessert')) return FOOD_IMAGE_URLS.dessert
    if (category.includes('north indian')) return FOOD_IMAGE_URLS.northIndian
    if (category.includes('south indian')) return FOOD_IMAGE_URLS.southIndian
    if (category.includes('beverages')) return FOOD_IMAGE_URLS.beverages
    return FOOD_IMAGE_URLS.default
  }

  const handleFav = (e) => {
    e.stopPropagation()
    setIsFav(!isFav)
    toast(isFav ? '💔 Removed from favorites' : '❤️ Added to favorites!', { duration: 1500 })
  }

  return (
    <div
      className="food-card reveal"
      ref={ref}
      style={{ animationDelay: `${delay}s` }}
      onClick={() => navigate(`/food/${food._id}`)}
    >
      <div className={`food-card-img-wrap ${imgLoaded ? 'loaded' : ''}`}>
        <img
          src={getFoodImage()}
          alt={food.name}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
        />
        <div className="card-badges">
          {food.isVeg
            ? <span className="badge veg">🟢 Veg</span>
            : <span className="badge nonveg">🔴 Non-Veg</span>
          }
          {food.discount > 0 && (
            <span className="badge discount">{food.discount}% OFF</span>
          )}
        </div>
        <button className={`btn-fav ${isFav ? 'active' : ''}`} onClick={handleFav} title="Favourite">
          {isFav ? '❤️' : '🤍'}
        </button>
        <div className="card-img-overlay" />
      </div>

      <div className="food-card-body">
        <div className="card-top">
          <h3 className="food-name">{food.name}</h3>
          <p className="food-desc">{food.description?.substring(0, 60)}</p>
        </div>

        <div className="food-meta">
          <span className="rating">⭐ {food.rating || '4.5'}</span>
          <span className="dot">·</span>
          <span className="reviews">{food.totalRatings || 0} reviews</span>
          <span className="dot">·</span>
          <span className="prep-time">⏱ 25 min</span>
        </div>

        <div className="food-card-footer">
          <div className="price-group">
            <span className="price-main">₹{discountedPrice}</span>
            {food.discount > 0 && (
              <span className="price-original">₹{food.price}</span>
            )}
          </div>
          <button
            className="btn-add-cart"
            onClick={(e) => { e.stopPropagation(); onAddToCart(food) }}
          >
            <span className="btn-add-icon">+</span>
            <span className="btn-add-text">Add</span>
          </button>
        </div>
      </div>
    </div>
  )
}

// ==================== Section Wrapper ====================
const Section = ({ children, className = '' }) => {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add('visible') },
      { threshold: 0.05 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return <section className={`home-section reveal ${className}`} ref={ref}>{children}</section>
}

// ==================== Skeleton Card ====================
const SkeletonCard = () => (
  <div className="skeleton-card">
    <div className="skeleton-img shimmer" />
    <div className="skeleton-body">
      <div className="skeleton-line w-70 shimmer" />
      <div className="skeleton-line w-90 shimmer" />
      <div className="skeleton-line w-50 shimmer" />
      <div className="skeleton-footer shimmer" />
    </div>
  </div>
)

// ==================== Main UserHome ====================
const UserHome = () => {
  const [foods, setFoods] = useState([])
  const [popularFoods, setPopularFoods] = useState([])
  const [trendingFoods, setTrendingFoods] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchSuggestions, setSearchSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeCategory, setActiveCategory] = useState('all')
  const [isSearching, setIsSearching] = useState(false)
  const [heroVisible, setHeroVisible] = useState(false)

  const searchTimeoutRef = useRef(null)
  const searchInputRef = useRef(null)
  const { addItem } = useCart()
  const navigate = useNavigate()

  useEffect(() => {
    setTimeout(() => setHeroVisible(true), 100)
    fetchData()
  }, [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [foodsRes, popularRes, trendingRes] = await Promise.all([
        getAllFoods(),
        getPopularFoods(),
        getTrendingFoods(),
      ])
      setFoods(foodsRes.foods || [])
      setPopularFoods(popularRes.foods || [])
      setTrendingFoods(trendingRes.foods || [])
    } catch (err) {
      console.error('Failed to fetch foods:', err)
      toast.error('Failed to load foods')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSearchInput = (value) => {
    setSearchQuery(value)
    clearTimeout(searchTimeoutRef.current)
    if (!value.trim()) { 
      setSearchSuggestions([])
      setShowSuggestions(false)
      return 
    }
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await searchFoods(value)
        setSearchSuggestions((res.foods || []).slice(0, 5))
        setShowSuggestions(true)
      } catch (err) {
        console.error('Search error:', err)
      }
    }, 300)
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) { 
      fetchData()
      setShowSuggestions(false)
      return 
    }
    setIsSearching(true)
    setLoading(true)
    setShowSuggestions(false)
    try {
      const res = await searchFoods(searchQuery)
      const results = res.foods || []
      setFoods(results)
      setActiveCategory('all')
      if (results.length === 0) {
        toast.error(`No results for "${searchQuery}"`)
      } else {
        toast.success(`Found ${results.length} items 🎉`)
      }
    } catch (err) {
      console.error('Search failed:', err)
      toast.error('Search failed. Try again.')
    } finally {
      setLoading(false)
      setIsSearching(false)
    }
  }

  const handleSuggestionClick = (item) => {
    setSearchQuery(item.name)
    setShowSuggestions(false)
    setTimeout(() => handleSearch(), 100)
  }

  useEffect(() => {
    const handler = (e) => {
      if (searchInputRef.current && !searchInputRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  const handleAddToCart = async (food) => {
    const result = await addItem(food._id, 1)
    if (result.success) {
      toast.success(`${food.name} added to cart! 🛒`, { duration: 2000 })
    } else {
      toast.error(result.message || 'Failed to add item')
    }
  }

  const filteredFoods = activeCategory === 'all'
    ? foods
    : foods.filter((f) => f.category === activeCategory)

  return (
    <div className="user-home">
      {/* Hero Banner */}
      <div className={`hero-banner ${heroVisible ? 'hero-visible' : ''}`}>
        <div className="hero-bg-blobs">
          <div className="blob blob-1" />
          <div className="blob blob-2" />
          <div className="blob blob-3" />
        </div>
        <div className="hero-content">
          <div className="hero-tag">🚀 Free delivery on first order</div>
          <h1 className="hero-title">
            Craving something<br />
            <span className="hero-accent">Delicious?</span>
          </h1>
          <p className="hero-subtitle">
            Order from 500+ restaurants · Delivered in under 30 mins
          </p>

          <div className="search-wrapper" ref={searchInputRef}>
            <div className="search-bar">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search pizza, biryani, burgers..."
                value={searchQuery}
                onChange={(e) => handleSearchInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                onFocus={() => searchQuery.trim() && setShowSuggestions(true)}
              />
              <button className="search-btn" onClick={handleSearch} disabled={isSearching}>
                {isSearching ? <span className="search-spinner" /> : 'Search'}
              </button>
            </div>

            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="search-dropdown">
                {searchSuggestions.map((item) => (
                  <div key={item._id} className="suggestion-row" onClick={() => handleSuggestionClick(item)}>
                    <span className="sugg-icon">🍴</span>
                    <div className="sugg-info">
                      <span className="sugg-name">{item.name}</span>
                      <span className="sugg-cat">{item.category}</span>
                    </div>
                    <span className="sugg-arrow">→</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="hero-stats">
            <div className="stat"><span className="stat-num">500+</span><span className="stat-label">Restaurants</span></div>
            <div className="stat-divider" />
            <div className="stat"><span className="stat-num">30min</span><span className="stat-label">Avg Delivery</span></div>
            <div className="stat-divider" />
            <div className="stat"><span className="stat-num">4.8⭐</span><span className="stat-label">Rating</span></div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-plate">
            <img src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&h=500&fit=crop" alt="food" />
            <div className="plate-ring plate-ring-1" />
            <div className="plate-ring plate-ring-2" />
            <div className="floating-pill pill-1">🍕 Pizza — ₹299</div>
            <div className="floating-pill pill-2">⭐ 4.9 Rating</div>
            <div className="floating-pill pill-3">⏱ 20 min</div>
          </div>
        </div>
      </div>

      <div className="main-content">
        {/* Trending Section */}
        {(loading || trendingFoods.length > 0) && (
          <Section>
            <div className="section-header">
              <div className="section-title-wrap">
                <span className="section-emoji">🔥</span>
                <div>
                  <h2 className="section-title">Trending Now</h2>
                  <p className="section-subtitle">Most ordered in your area today</p>
                </div>
              </div>
              <button className="view-all-btn" onClick={() => navigate('/trending')}>
                View All <span>→</span>
              </button>
            </div>
            <div className="food-grid">
              {loading
                ? [1, 2, 3, 4].map(i => <SkeletonCard key={i} />)
                : trendingFoods.slice(0, 4).map((food, i) => (
                    <FoodCard key={food._id} food={food} onAddToCart={handleAddToCart} delay={i * 0.08} />
                  ))
              }
            </div>
          </Section>
        )}

        <div className="section-divider" />

        {/* Popular Section */}
        {(loading || popularFoods.length > 0) && (
          <Section>
            <div className="section-header">
              <div className="section-title-wrap">
                <span className="section-emoji">⭐</span>
                <div>
                  <h2 className="section-title">Most Popular</h2>
                  <p className="section-subtitle">Customer favourites, all time hits</p>
                </div>
              </div>
              <button className="view-all-btn" onClick={() => navigate('/popular')}>
                View All <span>→</span>
              </button>
            </div>
            <div className="food-grid">
              {loading
                ? [1, 2, 3, 4].map(i => <SkeletonCard key={i} />)
                : popularFoods.slice(0, 4).map((food, i) => (
                    <FoodCard key={food._id} food={food} onAddToCart={handleAddToCart} delay={i * 0.08} />
                  ))
              }
            </div>
          </Section>
        )}

        <div className="section-divider" />

        {/* All Items Section */}
        <Section>
          <div className="section-header">
            <div className="section-title-wrap">
              <span className="section-emoji">🍽️</span>
              <div>
                <h2 className="section-title">All Items</h2>
                <p className="section-subtitle">Browse our full menu</p>
              </div>
            </div>
          </div>

          <div className="category-scroll">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                className={`cat-pill ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                <span className="cat-emoji">{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {loading ? (
            <div className="food-grid">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : filteredFoods.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🍽️</div>
              <h3>Nothing found here</h3>
              <p>Try a different category or search term</p>
              <button className="reset-btn" onClick={() => { setActiveCategory('all'); fetchData() }}>
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="food-grid">
              {filteredFoods.map((food, i) => (
                <FoodCard key={food._id} food={food} onAddToCart={handleAddToCart} delay={(i % 4) * 0.07} />
              ))}
            </div>
          )}
        </Section>
      </div>
    </div>
  )
}

export default UserHome