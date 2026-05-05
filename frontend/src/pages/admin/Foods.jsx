import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import AdminHeader from '../../components/admin/AdminHeader'
import AdminSidebar from '../../components/admin/AdminSidebar'
import FoodCard from '../../components/admin/FoodCard'
import { getAdminFoods, createFood, updateFood, deleteFood } from '../../services/admin'
import toast from 'react-hot-toast'
import '../../styles/admin/foods.css'

const Foods = () => {
  const { user } = useAuth()
  const [foods, setFoods] = useState([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingFood, setEditingFood] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    isAvailable: true,
    isVeg: true,
    isTrending: false,
    isPremium: false,
    isChefSpecial: false,
    discount: 0
  })

  const [formErrors, setFormErrors] = useState({})

  const categories = ['Pizza', 'North Indian', 'South Indian', 'Biryani', 'Fast Food', 'Dessert', 'Chinese', 'Beverages', 'Breakfast', 'Street Food']

  useEffect(() => {
    fetchFoods()
  }, [])

  const fetchFoods = useCallback(async () => {
    setLoading(true)
    try {
      const response = await getAdminFoods()
      setFoods(response.foods || [])
    } catch (error) {
      console.error('Failed to fetch foods:', error)
      toast.error('Failed to load foods')
    } finally {
      setLoading(false)
    }
  }, [])

  const filteredAndSortedFoods = useMemo(() => {
    let filtered = [...foods]

    if (searchTerm) {
      filtered = filtered.filter(food =>
        food.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        food.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        food.category?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(food => food.category === selectedCategory)
    }

    if (filterStatus === 'available') {
      filtered = filtered.filter(food => food.isAvailable)
    } else if (filterStatus === 'unavailable') {
      filtered = filtered.filter(food => !food.isAvailable)
    }

    switch (sortBy) {
      case 'priceLow':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'priceHigh':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      default:
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        break
    }

    return filtered
  }, [foods, searchTerm, selectedCategory, filterStatus, sortBy])

  const validateForm = () => {
    const errors = {}
    if (!formData.name?.trim()) errors.name = 'Food name is required'
    if (!formData.category) errors.category = 'Category is required'
    if (!formData.price || formData.price <= 0) errors.price = 'Valid price is required'
    if (formData.discount < 0 || formData.discount > 100) errors.discount = 'Discount must be between 0 and 100'
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please fix the form errors')
      return
    }

    setIsSubmitting(true)
    const data = {
      ...formData,
      price: parseFloat(formData.price),
      discount: parseFloat(formData.discount) || 0
    }

    try {
      if (editingFood) {
        await updateFood(editingFood._id, data)
        toast.success('Food updated successfully')
      } else {
        await createFood(data)
        toast.success('Food added successfully')
      }
      setShowModal(false)
      setEditingFood(null)
      resetForm()
      fetchFoods()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      image: '',
      isAvailable: true,
      isVeg: true,
      isTrending: false,
      isPremium: false,
      isChefSpecial: false,
      discount: 0
    })
    setFormErrors({})
  }

  const handleEdit = (food) => {
    setEditingFood(food)
    setFormData({
      name: food.name,
      description: food.description || '',
      price: food.price,
      category: food.category,
      image: food.image || '',
      isAvailable: food.isAvailable,
      isVeg: food.isVeg,
      isTrending: food.isTrending || false,
      isPremium: food.isPremium || false,
      isChefSpecial: food.isChefSpecial || false,
      discount: food.discount || 0
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this food item? This action cannot be undone.')) {
      try {
        await deleteFood(id)
        toast.success('Food deleted successfully')
        fetchFoods()
      } catch (error) {
        toast.error(error.response?.data?.message || 'Delete failed')
      }
    }
  }

  const handleToggleAvailability = async (food) => {
    try {
      await updateFood(food._id, { isAvailable: !food.isAvailable })
      toast.success(`${food.name} is now ${!food.isAvailable ? 'available' : 'unavailable'}`)
      fetchFoods()
    } catch (error) {
      toast.error('Status update failed')
    }
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const getCategoryStats = useMemo(() => {
    const stats = {}
    foods.forEach(food => {
      stats[food.category] = (stats[food.category] || 0) + 1
    })
    return stats
  }, [foods])

  if (loading) {
    return (
      <>
        <AdminHeader onMenuClick={toggleSidebar} />
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="admin-main-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading menu items...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <AdminHeader onMenuClick={toggleSidebar} />
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="admin-main-content">
        {/* Page Header */}
        <div className="page-header">
          <div>
            <h1>Food Management</h1>
            <p>Manage your restaurant menu items</p>
          </div>
          <button 
            className="btn-primary"
            onClick={() => {
              setEditingFood(null)
              resetForm()
              setShowModal(true)
            }}
          >
            <span className="btn-icon">+</span>
            Add New Food
          </button>
        </div>

        {/* Filters Section */}
        <div className="filters-section">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by name, category or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button className="clear-search" onClick={() => setSearchTerm('')}>✕</button>
            )}
          </div>

          <div className="filters-row">
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Categories ({foods.length})</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat} ({getCategoryStats[cat] || 0})
                </option>
              ))}
            </select>

            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>

            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="newest">Newest First</option>
              <option value="priceLow">Price: Low to High</option>
              <option value="priceHigh">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
            </select>
          </div>

          {selectedCategory !== 'all' && (
            <div className="active-filters">
              <span className="filter-tag">
                Category: {selectedCategory}
                <button onClick={() => setSelectedCategory('all')}>×</button>
              </span>
            </div>
          )}
        </div>

        {/* Stats Summary */}
        <div className="stats-summary">
          <div className="stat-card">
            <div className="stat-icon">🍔</div>
            <div className="stat-info">
              <span className="stat-value">{foods.length}</span>
              <span className="stat-label">Total Items</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <span className="stat-value">{foods.filter(f => f.isAvailable).length}</span>
              <span className="stat-label">Available</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">❌</div>
            <div className="stat-info">
              <span className="stat-value">{foods.filter(f => !f.isAvailable).length}</span>
              <span className="stat-label">Unavailable</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🏷️</div>
            <div className="stat-info">
              <span className="stat-value">{categories.length}</span>
              <span className="stat-label">Categories</span>
            </div>
          </div>
        </div>

        {/* Foods Grid */}
        {filteredAndSortedFoods.length === 0 ? (
          <div className="no-data">
            {searchTerm || selectedCategory !== 'all' || filterStatus !== 'all' ? (
              <>
                <div className="no-data-icon">🔍</div>
                <p>No matching food items found</p>
                <button 
                  className="btn-secondary"
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedCategory('all')
                    setFilterStatus('all')
                  }}
                >
                  Clear Filters
                </button>
              </>
            ) : (
              <>
                <div className="no-data-icon">🍕</div>
                <p>No food items in your menu yet</p>
                <button 
                  className="btn-primary"
                  onClick={() => {
                    setEditingFood(null)
                    resetForm()
                    setShowModal(true)
                  }}
                >
                  Add Your First Food
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="foods-grid">
            {filteredAndSortedFoods.map((food) => (
              <FoodCard
                key={food._id}
                food={food}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleAvailability={handleToggleAvailability}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Food Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <span className="modal-icon">{editingFood ? '✏️' : '➕'}</span>
                <h2>{editingFood ? 'Edit Food Item' : 'Add New Food'}</h2>
              </div>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Food Name <span className="required">*</span></label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Margherita Pizza"
                    className={formErrors.name ? 'error' : ''}
                  />
                  {formErrors.name && <span className="error-message">{formErrors.name}</span>}
                </div>
                
                <div className="form-group">
                  <label>Category <span className="required">*</span></label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={formErrors.category ? 'error' : ''}
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {formErrors.category && <span className="error-message">{formErrors.category}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price (₹) <span className="required">*</span></label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="e.g., 299"
                    min="0"
                    step="1"
                    className={formErrors.price ? 'error' : ''}
                  />
                  {formErrors.price && <span className="error-message">{formErrors.price}</span>}
                </div>
                
                <div className="form-group">
                  <label>Discount (%)</label>
                  <input
                    type="number"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    placeholder="0"
                    min="0"
                    max="100"
                  />
                  {formData.discount > 0 && (
                    <span className="input-hint">
                      Final price: ₹{formData.price - (formData.price * formData.discount / 100)}
                    </span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  placeholder="Describe your food item..."
                  maxLength="500"
                />
                <span className="input-hint">{formData.description.length}/500 characters</span>
              </div>

              <div className="form-group">
                <label>Image URL</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://example.com/food-image.jpg"
                />
                {formData.image && (
                  <div className="image-preview">
                    <img src={formData.image} alt="Preview" onError={(e) => e.target.style.display = 'none'} />
                    <span className="preview-text">Image Preview</span>
                  </div>
                )}
              </div>

              <div className="form-divider">
                <span>Additional Settings</span>
              </div>

              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.isVeg}
                    onChange={(e) => setFormData({ ...formData, isVeg: e.target.checked })}
                  />
                  <span className="checkbox-icon">🟢</span>
                  <span>Vegetarian</span>
                </label>
                
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                  />
                  <span className="checkbox-icon">✅</span>
                  <span>Available for ordering</span>
                </label>
                
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.isTrending}
                    onChange={(e) => setFormData({ ...formData, isTrending: e.target.checked })}
                  />
                  <span className="checkbox-icon">🔥</span>
                  <span>Mark as Trending</span>
                </label>
                
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.isPremium}
                    onChange={(e) => setFormData({ ...formData, isPremium: e.target.checked })}
                  />
                  <span className="checkbox-icon">⭐</span>
                  <span>Premium Item</span>
                </label>
                
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.isChefSpecial}
                    onChange={(e) => setFormData({ ...formData, isChefSpecial: e.target.checked })}
                  />
                  <span className="checkbox-icon">👨‍🍳</span>
                  <span>Chef's Special</span>
                </label>
              </div>

              <div className="modal-buttons">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <span className="spinner-small"></span>
                      {editingFood ? 'Updating...' : 'Adding...'}
                    </>
                  ) : (
                    editingFood ? 'Update Food' : 'Add Food'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default Foods