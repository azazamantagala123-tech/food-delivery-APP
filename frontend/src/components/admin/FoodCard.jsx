import React from 'react'

const FoodCard = ({ food, onEdit, onDelete, onToggleAvailability }) => {
  const discountedPrice = food.discount 
    ? food.price - (food.price * food.discount / 100) 
    : food.price

  return (
    <div className="food-card">
      <div className="food-card-image">
        <img 
          src={food.image || 'https://via.placeholder.com/300x200?text=No+Image'} 
          alt={food.name}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x200?text=Food+Image'
          }}
        />
        <div className="food-badges">
          {food.isVeg ? (
            <span className="food-badge veg">🟢 Veg</span>
          ) : (
            <span className="food-badge nonveg">🔴 Non-Veg</span>
          )}
          {food.discount > 0 && (
            <span className="food-badge discount">{food.discount}% OFF</span>
          )}
          {!food.isAvailable && (
            <span className="food-badge unavailable">Out of Stock</span>
          )}
        </div>
      </div>
      
      <div className="food-card-body">
        <h3 className="food-card-title">{food.name}</h3>
        <p className="food-card-category">{food.category}</p>
        <div className="food-card-price">
          {food.discount > 0 ? (
            <>
              <span className="original-price">₹{food.price}</span>
              <span className="current-price">₹{discountedPrice}</span>
            </>
          ) : (
            <span className="current-price">₹{food.price}</span>
          )}
        </div>
        <div className="food-card-actions">
          <button className="edit-btn" onClick={() => onEdit(food)}>
            ✏️ Edit
          </button>
          <button className="delete-btn" onClick={() => onDelete(food._id)}>
            🗑️ Delete
          </button>
          {onToggleAvailability && (
            <button 
              className={`status-btn ${food.isAvailable ? 'active' : 'inactive'}`}
              onClick={() => onToggleAvailability(food)}
            >
              {food.isAvailable ? 'Available' : 'Unavailable'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default FoodCard