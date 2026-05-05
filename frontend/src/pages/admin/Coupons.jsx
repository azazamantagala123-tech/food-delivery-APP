import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getCoupons, createCoupon, updateCoupon, deleteCoupon, toggleCoupon } from '../../services/admin'
import toast from 'react-hot-toast'
import '../../styles/admin/common.css'      // ✅ ADD THIS
import '../../styles/admin/coupons.css' 

const Coupons = () => {
  const { token } = useAuth()
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState(null)
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minOrderAmount: '',
    maxDiscount: '',
    validFrom: '',
    validUntil: '',
    usageLimit: ''
  })

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    setLoading(true)
    try {
      const response = await getCoupons()
      setCoupons(response.coupons || [])
    } catch (error) {
      console.error('Failed to fetch coupons:', error)
      toast.error('Failed to load coupons')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const data = {
      code: formData.code.toUpperCase(),
      description: formData.description,
      discountType: formData.discountType,
      discountValue: parseFloat(formData.discountValue),
      minOrderAmount: parseFloat(formData.minOrderAmount) || 0,
      maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
      validFrom: formData.validFrom,
      validUntil: formData.validUntil,
      usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null
    }

    try {
      if (editingCoupon) {
        await updateCoupon(editingCoupon._id, data)
        toast.success('Coupon updated successfully')
      } else {
        await createCoupon(data)
        toast.success('Coupon created successfully')
      }
      setShowModal(false)
      setEditingCoupon(null)
      resetForm()
      fetchCoupons()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed')
    }
  }

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      minOrderAmount: '',
      maxDiscount: '',
      validFrom: '',
      validUntil: '',
      usageLimit: ''
    })
  }

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon)
    setFormData({
      code: coupon.code,
      description: coupon.description || '',
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount,
      maxDiscount: coupon.maxDiscount || '',
      validFrom: coupon.validFrom?.split('T')[0] || '',
      validUntil: coupon.validUntil?.split('T')[0] || '',
      usageLimit: coupon.usageLimit || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        await deleteCoupon(id)
        toast.success('Coupon deleted successfully')
        fetchCoupons()
      } catch (error) {
        toast.error(error.response?.data?.message || 'Delete failed')
      }
    }
  }

  const handleToggle = async (id, currentStatus) => {
    try {
      await toggleCoupon(id)
      toast.success(`Coupon ${currentStatus ? 'deactivated' : 'activated'}`)
      fetchCoupons()
    } catch (error) {
      toast.error('Status update failed')
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString()
  }

  if (loading) {
    return <div className="loading">Loading coupons...</div>
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Coupon Management</h1>
        <button className="btn-primary" onClick={() => {
          setEditingCoupon(null)
          resetForm()
          setShowModal(true)
        }}>
          + Add Coupon
        </button>
      </div>

      <div className="coupons-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Code</th>
              <th>Description</th>
              <th>Discount</th>
              <th>Min Order</th>
              <th>Valid From</th>
              <th>Valid Until</th>
              <th>Used</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon, index) => (
              <tr key={coupon._id}>
                <td>{index + 1}</td>
                <td><span className="coupon-code">{coupon.code}</span></td>
                <td>{coupon.description?.substring(0, 30)}</td>
                <td>
                  {coupon.discountType === 'percentage' 
                    ? `${coupon.discountValue}%` 
                    : `₹${coupon.discountValue}`}
                  {coupon.maxDiscount && ` (Max ₹${coupon.maxDiscount})`}
                </td>
                <td>₹{coupon.minOrderAmount}</td>
                <td>{formatDate(coupon.validFrom)}</td>
                <td>{formatDate(coupon.validUntil)}</td>
                <td>{coupon.usedCount} / {coupon.usageLimit || '∞'}</td>
                <td>
                  <button 
                    className={`status-btn ${coupon.isActive ? 'active' : 'inactive'}`}
                    onClick={() => handleToggle(coupon._id, coupon.isActive)}
                  >
                    {coupon.isActive ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td>
                  <button className="edit-btn" onClick={() => handleEdit(coupon)}>Edit</button>
                  <button className="delete-btn" onClick={() => handleDelete(coupon._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <h2>{editingCoupon ? 'Edit Coupon' : 'Add Coupon'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Coupon Code *</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="SAVE20"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Discount Type *</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    required
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Discount Value *</label>
                  <input
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    placeholder={formData.discountType === 'percentage' ? '20' : '100'}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Min Order Amount</label>
                  <input
                    type="number"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                    placeholder="499"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Max Discount (for percentage)</label>
                  <input
                    type="number"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                    placeholder="100"
                  />
                </div>
                <div className="form-group">
                  <label>Usage Limit</label>
                  <input
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    placeholder="100"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Valid From *</label>
                  <input
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Valid Until *</label>
                  <input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="2"
                  placeholder="Brief description of the coupon"
                />
              </div>

              <div className="modal-buttons">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Coupon</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Coupons