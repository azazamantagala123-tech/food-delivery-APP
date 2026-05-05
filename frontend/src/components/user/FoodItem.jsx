import React from 'react'
import { useNavigate } from 'react-router-dom'
import './FoodItem.css'

const FoodItem = ({ food, onAddToCart }) => {
  const navigate = useNavigate()

  const discountedPrice = food.discount 
    ? food.price - (food.price * food.discount / 100) 
    : food.price

  return (
    <div 
      className="food-card"
      onClick={() => navigate(`/food/${food._id}`)}
    >
      <div className="food-image">
        <img 
          src={food.image || 'https://via.placeholder.com/200'} 
          alt={food.name} 
        />

        {food.isVeg ? (
          <span className="veg-badge">🟢 Veg</span>
        ) : (
          <span className="nonveg-badge">🔴 Non-Veg</span>
        )}

        {food.discount > 0 && (
          <span className="discount-badge">{food.discount}% OFF</span>
        )}
      </div>

      <div className="food-info">
        <h3>{food.name}</h3>

        <p className="food-description">
          {food.description?.substring(0, 60)}
        </p>

        <div className="food-rating">
          <span className="stars">⭐ {food.rating || 0}</span>
          <span className="reviews">({food.totalRatings || 0} reviews)</span>
        </div>

        <div className="food-price">
          {food.discount > 0 ? (
            <>
              <span className="original-price">₹{food.price}</span>
              <span className="discounted-price">₹{discountedPrice}</span>
            </>
          ) : (
            <span className="price">₹{food.price}</span>
          )}
        </div>

        <button 
          className="add-to-cart"
          onClick={(e) => {
            e.stopPropagation()   // 🔥 IMPORTANT FIX
            onAddToCart(food)
          }}
        >
          Add to Cart
        </button>
      </div>
    </div>
  )
}

export default FoodItem