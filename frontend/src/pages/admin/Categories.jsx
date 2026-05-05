import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../services/admin'
import toast from 'react-hot-toast'
import '../../styles/admin/common.css'      // ✅ ADD THIS
import '../../styles/admin/categories.css'   // ✅ ADD THIS

const Categories = () => {
  const { token } = useAuth()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    sortOrder: 0,
    isActive: true
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const response = await getCategories()
      setCategories(response.categories || [])
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      toast.error('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingCategory) {
        await updateCategory(editingCategory._id, formData)
        toast.success('Category updated successfully')
      } else {
        await createCategory(formData)
        toast.success('Category created successfully')
      }
      setShowModal(false)
      setEditingCategory(null)
      setFormData({ name: '', description: '', image: '', sortOrder: 0, isActive: true })
      fetchCategories()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed')
    }
  }

  const handleEdit = (category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || '',
      image: category.image || '',
      sortOrder: category.sortOrder || 0,
      isActive: category.isActive !== false
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteCategory(id)
        toast.success('Category deleted successfully')
        fetchCategories()
      } catch (error) {
        toast.error(error.response?.data?.message || 'Delete failed')
      }
    }
  }

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await updateCategory(id, { isActive: !currentStatus })
      toast.success(`Category ${!currentStatus ? 'activated' : 'deactivated'}`)
      fetchCategories()
    } catch (error) {
      toast.error('Status update failed')
    }
  }

  if (loading) {
    return <div className="loading">Loading categories...</div>
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Category Management</h1>
        <button className="btn-primary" onClick={() => {
          setEditingCategory(null)
          setFormData({ name: '', description: '', image: '', sortOrder: 0, isActive: true })
          setShowModal(true)
        }}>
          + Add Category
        </button>
      </div>

      <div className="categories-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Description</th>
              <th>Image</th>
              <th>Sort Order</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category, index) => (
              <tr key={category._id}>
                <td>{index + 1}</td>
                <td>{category.name}</td>
                <td>{category.description?.substring(0, 50)}</td>
                <td>
                  {category.image ? (
                    <img src={category.image} alt={category.name} className="table-image" />
                  ) : (
                    <span className="no-image">No image</span>
                  )}
                </td>
                <td>{category.sortOrder}</td>
                <td>
                  <button 
                    className={`status-btn ${category.isActive ? 'active' : 'inactive'}`}
                    onClick={() => handleToggleStatus(category._id, category.isActive)}
                  >
                    {category.isActive ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td>
                  <button className="edit-btn" onClick={() => handleEdit(category)}>Edit</button>
                  <button className="delete-btn" onClick={() => handleDelete(category._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingCategory ? 'Edit Category' : 'Add Category'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Category Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Image URL</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="form-group">
                <label>Sort Order</label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
                />
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  Active
                </label>
              </div>
              <div className="modal-buttons">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Categories