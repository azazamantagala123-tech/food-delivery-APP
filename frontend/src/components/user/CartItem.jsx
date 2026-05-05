import React, { useState } from 'react'
import './CartItem.css'

const CartItem = ({ 
  item, 
  onUpdateQuantity, 
  onRemove, 
  onSaveForLater, 
  onMoveToCart,
  isSavedForLater = false 
}) => {
  const [quantity, setQuantity] = useState(item.quantity)
  const [isUpdating, setIsUpdating] = useState(false)
  const [showRemoveModal, setShowRemoveModal] = useState(false)

  const discountedPrice = item.discount 
    ? item.price - (item.price * item.discount / 100) 
    : item.price

  const totalPrice = discountedPrice * quantity

  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1) {
      setShowRemoveModal(true)
      return
    }
    if (newQuantity > 99) {
      alert('Maximum 99 items allowed')
      return
    }
    
    setIsUpdating(true)
    setQuantity(newQuantity)
    await onUpdateQuantity(item.foodId, newQuantity)
    setIsUpdating(false)
  }

  const handleIncrement = () => handleQuantityChange(quantity + 1)
  const handleDecrement = () => handleQuantityChange(quantity - 1)

  const handleRemove = async () => {
    setIsUpdating(true)
    await onRemove(item.foodId)
    setIsUpdating(false)
    setShowRemoveModal(false)
  }

  const getVegBadge = () => {
    if (item.isVeg) {
      return <span className="veg-badge">🟢 Veg</span>
    }
    return <span className="nonveg-badge">🔴 Non-Veg</span>
  }

  const getDiscountBadge = () => {
    if (item.discount > 0) {
      return <span className="discount-badge">{item.discount}% OFF</span>
    }
    return null
  }

  return (
    <>
      <div className={`cart-item ${isSavedForLater ? 'saved-for-later' : ''}`}>
        <div className="cart-item-image">
          <img 
            src={item.image || 'https://via.placeholder.com/100x100?text=No+Image'} 
            alt={item.name}
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/100x100?text=No+Image'
            }}
          />
          {getDiscountBadge()}
          {getVegBadge()}
          {!item.isAvailable && (
            <div className="unavailable-overlay">
              <span>Out of Stock</span>
            </div>
          )}
        </div>

        <div className="cart-item-details">
          <div className="cart-item-header">
            <h3 className="cart-item-name">{item.name}</h3>
            {item.isTrending && <span className="trending-badge">🔥 Trending</span>}
            {item.isPremium && <span className="premium-badge">⭐ Premium</span>}
          </div>
          
          {item.description && (
            <p className="cart-item-description">{item.description.substring(0, 80)}</p>
          )}

          {item.specialInstructions && (
            <div className="special-instructions">
              <span className="instructions-icon">📝</span>
              <span className="instructions-text">{item.specialInstructions}</span>
            </div>
          )}

          <div className="cart-item-meta">
            <div className="cart-item-price">
              {item.discount > 0 ? (
                <>
                  <span className="original-price">₹{item.price}</span>
                  <span className="discounted-price">₹{discountedPrice}</span>
                </>
              ) : (
                <span className="price">₹{item.price}</span>
              )}
            </div>

            {!isSavedForLater && (
              <div className="cart-item-quantity">
                <button 
                  className="qty-btn"
                  onClick={handleDecrement}
                  disabled={isUpdating || !item.isAvailable}
                >
                  −
                </button>
                <span className="qty-value">{quantity}</span>
                <button 
                  className="qty-btn"
                  onClick={handleIncrement}
                  disabled={isUpdating || !item.isAvailable}
                >
                  +
                </button>
              </div>
            )}

            <div className="cart-item-total">
              <span className="total-label">Total:</span>
              <span className="total-amount">₹{totalPrice.toLocaleString()}</span>
            </div>
          </div>

          <div className="cart-item-actions">
            {!isSavedForLater ? (
              <>
                <button 
                  className="action-btn save-later"
                  onClick={() => onSaveForLater && onSaveForLater(item)}
                  disabled={isUpdating}
                >
                  📌 Save for Later
                </button>
                <button 
                  className="action-btn remove"
                  onClick={() => setShowRemoveModal(true)}
                  disabled={isUpdating}
                >
                  🗑️ Remove
                </button>
              </>
            ) : (
              <>
                <button 
                  className="action-btn move-to-cart"
                  onClick={() => onMoveToCart && onMoveToCart(item)}
                  disabled={isUpdating}
                >
                  🛒 Move to Cart
                </button>
                <button 
                  className="action-btn remove"
                  onClick={() => setShowRemoveModal(true)}
                  disabled={isUpdating}
                >
                  🗑️ Remove
                </button>
              </>
            )}
          </div>
        </div>

        {isUpdating && (
          <div className="cart-item-loader">
            <div className="mini-spinner"></div>
          </div>
        )}
      </div>

      {/* Remove Confirmation Modal */}
      {showRemoveModal && (
        <div className="modal-overlay" onClick={() => setShowRemoveModal(false)}>
          <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
            <h2>Remove Item</h2>
            <p>Are you sure you want to remove <strong>{item.name}</strong> from your cart?</p>
            <div className="modal-buttons">
              <button className="btn-secondary" onClick={() => setShowRemoveModal(false)}>
                Cancel
              </button>
              <button className="btn-danger" onClick={handleRemove}>
                Remove Item
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default CartItem