import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getFoodById, getRelatedFoods } from '../../services/food'
import { useCart } from '../../contexts/CartContext'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'
import Loader from '../../components/delivery/common/Loader'
import '../../styles/user/FoodDetails.css'

// ==================== SAME IMAGE URLs as Home Page ====================
const FOOD_IMAGE_URLS = {
  pizza: 'https://tse1.mm.bing.net/th/id/OIP.2dhr5Ln6cMHIu9SmwE_uBgHaE7?rs=1&pid=ImgDetMain',
  burger: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&h=400&fit=crop',
  biryani: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=500&h=400&fit=crop',
  pasta: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=500&h=400&fit=crop',
  salad: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&h=400&fit=crop',
  dessert: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=500&h=400&fit=crop',
  northIndian: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=500&h=400&fit=crop',
  southIndian: 'https://images.unsplash.com/photo-1630384060421-cf20c0e6cf5e?w=500&h=400&fit=crop',
  fastfood: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&h=400&fit=crop',
  beverages: 'https://images.unsplash.com/photo-1543253687-c931c8e01820?w=500&h=400&fit=crop',
  default: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=400&fit=crop',
}

// ==================== SAME getFoodImage FUNCTION as Home Page ====================
const getFoodImage = (food) => {
  if (!food) return FOOD_IMAGE_URLS.default
  
  // If image is provided in backend, use it
  if (food.image && food.image !== '' && food.image !== 'null') {
    return food.image
  }
  
  const name = food.name?.toLowerCase() || ''
  const category = food.category?.toLowerCase() || ''
  
  if (name.includes('pizza') || category.includes('pizza')) return FOOD_IMAGE_URLS.pizza
  if (name.includes('burger') || category.includes('burger') || category.includes('fast food')) return FOOD_IMAGE_URLS.burger
  if (name.includes('biryani') || category.includes('biryani')) return FOOD_IMAGE_URLS.biryani
  if (name.includes('pasta')) return FOOD_IMAGE_URLS.pasta
  if (name.includes('salad')) return FOOD_IMAGE_URLS.salad
  if (name.includes('dessert') || name.includes('cake') || category.includes('dessert')) return FOOD_IMAGE_URLS.dessert
  if (category.includes('north indian')) return FOOD_IMAGE_URLS.northIndian
  if (category.includes('south indian')) return FOOD_IMAGE_URLS.southIndian
  if (category.includes('beverages')) return FOOD_IMAGE_URLS.beverages
  
  return FOOD_IMAGE_URLS.default
}

// ==================== MAIN COMPONENT ====================
const FoodDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const { isAuthenticated } = useAuth()

  const [food, setFood] = useState(null)
  const [relatedFoods, setRelatedFoods] = useState([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [addingToCart, setAddingToCart] = useState(false)

  const fetchFoodDetails = useCallback(async () => {
    if (!id) return
    
    setLoading(true)
    try {
      const [foodRes, relatedRes] = await Promise.all([
        getFoodById(id),
        getRelatedFoods(id)
      ])
      
      const foodData = foodRes.food || foodRes
      setFood(foodData)
      setRelatedFoods(relatedRes.foods || relatedRes || [])
      
      if (foodData?.variants?.length > 0) {
        setSelectedVariant(foodData.variants[0])
      }
    } catch (error) {
      console.error('Failed to fetch food details:', error)
      toast.error('Failed to load food details')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchFoodDetails()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [fetchFoodDetails])

  const getDiscountedPrice = useCallback(() => {
    if (!food) return 0
    const basePrice = selectedVariant?.price || food.price
    if (food.discount > 0) {
      return Math.round(basePrice - (basePrice * food.discount / 100))
    }
    return basePrice
  }, [food, selectedVariant])

  const getTotalPrice = useCallback(() => {
    return getDiscountedPrice() * quantity
  }, [getDiscountedPrice, quantity])

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart')
      navigate('/login')
      return
    }

    setAddingToCart(true)
    const result = await addItem(food._id, quantity, specialInstructions)
    
    if (result.success) {
      toast.success(`${food.name} added to cart! 🛒`)
    } else {
      toast.error(result.message || 'Failed to add item')
    }
    setAddingToCart(false)
  }

  const handleQuantityChange = (type) => {
    if (type === 'increase' && quantity < 10) {
      setQuantity(prev => prev + 1)
    } else if (type === 'decrease' && quantity > 1) {
      setQuantity(prev => prev - 1)
    }
  }

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to continue')
      navigate('/login')
      return
    }
    await handleAddToCart()
    navigate('/checkout')
  }

  if (loading) {
    return <Loader type="spinner" size="large" fullScreen text="Loading delicious details..." />
  }

  if (!food) {
    return (
      <div className="food-details-error">
        <div className="error-content">
          <span className="error-icon">🍽️</span>
          <h2>Food Not Found</h2>
          <p>The item you're looking for doesn't exist or has been removed.</p>
          <button className="btn-back-home" onClick={() => navigate('/home')}>Back to Home</button>
        </div>
      </div>
    )
  }

  const discountedPrice = getDiscountedPrice()
  const totalPrice = getTotalPrice()
  const savings = food.discount > 0 ? (food.price - discountedPrice) * quantity : 0

  return (
    <div className="food-details-page">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <span onClick={() => navigate('/home')}>Home</span>
          <span className="separator">/</span>
          <span onClick={() => navigate(`/category/${food.category}`)}>{food.category}</span>
          <span className="separator">/</span>
          <span className="active">{food.name}</span>
        </div>

        <div className="food-details-grid">
          {/* LEFT - Image Section */}
          <div className="food-image-section">
            <div className="main-image">
              <img 
                src={getFoodImage(food)} 
                alt={food.name}
              />
              {food.discount > 0 && (
                <div className="discount-badge-large">{food.discount}% OFF</div>
              )}
              <div className={food.isVeg ? "veg-badge-large" : "nonveg-badge-large"}>
                {food.isVeg ? '🟢 100% Vegetarian' : '🔴 Non-Vegetarian'}
              </div>
            </div>
          </div>

          {/* RIGHT - Info Section */}
          <div className="food-info-section">
            <div className="food-header">
              <h1 className="food-title">{food.name}</h1>
              <div className="food-badges">
                {food.isTrending && <span className="badge trending">🔥 Trending</span>}
                {food.isPremium && <span className="badge premium">⭐ Premium</span>}
                {food.isChefSpecial && <span className="badge chef">👨‍🍳 Chef's Special</span>}
              </div>
            </div>

            <div className="food-rating">
              <div className="stars">
                {'★'.repeat(Math.floor(food.rating || 4.5))}
                {'☆'.repeat(5 - Math.floor(food.rating || 4.5))}
              </div>
              <span className="rating-value">{food.rating || 4.5}</span>
              <span className="rating-count">({food.totalRatings || 0} reviews)</span>
            </div>

            <p className="food-description">{food.description || 'Delicious food item prepared with fresh ingredients.'}</p>

            {/* Variants */}
            {food.variants?.length > 0 && (
              <div className="variants-section">
                <label>Select Variant</label>
                <div className="variant-buttons">
                  {food.variants.map((variant) => (
                    <button
                      key={variant.name}
                      className={`variant-btn ${selectedVariant?.name === variant.name ? 'active' : ''}`}
                      onClick={() => setSelectedVariant(variant)}
                    >
                      {variant.name}
                      <span className="variant-price">₹{variant.price}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price */}
            <div className="price-section">
              <div className="price-info">
                {food.discount > 0 ? (
                  <>
                    <span className="original-price">₹{selectedVariant?.price || food.price}</span>
                    <span className="discounted-price">₹{discountedPrice}</span>
                    <span className="savings">Save ₹{savings}</span>
                  </>
                ) : (
                  <span className="current-price">₹{selectedVariant?.price || food.price}</span>
                )}
              </div>
            </div>

            {/* Quantity */}
            <div className="quantity-section">
              <label>Quantity</label>
              <div className="quantity-selector">
                <button className="qty-btn" onClick={() => handleQuantityChange('decrease')} disabled={quantity <= 1}>−</button>
                <span className="qty-value">{quantity}</span>
                <button className="qty-btn" onClick={() => handleQuantityChange('increase')} disabled={quantity >= 10}>+</button>
              </div>
              <div className="total-price">
                <span>Total Amount:</span>
                <strong>₹{totalPrice.toLocaleString()}</strong>
              </div>
            </div>

            {/* Instructions */}
            <div className="instructions-section">
              <label>Special Instructions (Optional)</label>
              <textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="e.g., Less spicy, Extra cheese, No onions..."
                rows="3"
              />
            </div>

            {/* Buttons */}
            <div className="action-buttons">
              <button className="btn-add-to-cart" onClick={handleAddToCart} disabled={addingToCart}>
                {addingToCart ? <><span className="spinner-small"></span> Adding...</> : <><span>🛒</span> Add to Cart</>}
              </button>
              <button className="btn-buy-now" onClick={handleBuyNow} disabled={addingToCart}>
                <span>⚡</span> Buy Now
              </button>
            </div>

            {/* Additional Info */}
            <div className="additional-info">
              <div className="info-item">
                <span className="info-icon">⏱️</span>
                <div>
                  <strong>Preparation Time</strong>
                  <p>20-25 minutes</p>
                </div>
              </div>
              <div className="info-item">
                <span className="info-icon">🚚</span>
                <div>
                  <strong>Delivery</strong>
                  <p>Free delivery on orders above ₹499</p>
                </div>
              </div>
              <div className="info-item">
                <span className="info-icon">💰</span>
                <div>
                  <strong>Payment</strong>
                  <p>Cash on delivery available</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Items */}
        {relatedFoods.length > 0 && (
          <div className="related-section">
            <h2 className="related-title">
              <span>🍽️</span> You May Also Like
            </h2>
            <div className="related-grid">
              {relatedFoods.map((item) => (
                <div 
                  key={item._id} 
                  className="related-card"
                  onClick={() => navigate(`/food/${item._id}`)}
                >
                  <div className="related-image">
                    <img src={getFoodImage(item)} alt={item.name} />
                    {item.discount > 0 && (
                      <span className="related-discount">{item.discount}% OFF</span>
                    )}
                  </div>
                  <div className="related-info">
                    <h4>{item.name}</h4>
                    <div className="related-price">
                      <span className="related-current">₹{item.price}</span>
                    </div>
                    <button className="related-add-btn">Quick View</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FoodDetails