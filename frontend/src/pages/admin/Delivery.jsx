import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getDeliveryBoys, createDeliveryBoy, updateDeliveryBoy, deleteDeliveryBoy, approveKYC, rejectKYC } from '../../services/admin'
import toast from 'react-hot-toast'
import '../../styles/admin/common.css'      // ✅ ADD THIS
import '../../styles/admin/delivery.css' 

const Delivery = () => {
  const { token } = useAuth()
  const [deliveryBoys, setDeliveryBoys] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingBoy, setEditingBoy] = useState(null)
  const [showKycModal, setShowKycModal] = useState(false)
  const [selectedBoy, setSelectedBoy] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  })

  useEffect(() => {
    fetchDeliveryBoys()
  }, [])

  const fetchDeliveryBoys = async () => {
    setLoading(true)
    try {
      const response = await getDeliveryBoys()
      setDeliveryBoys(response.deliveries || [])
    } catch (error) {
      console.error('Failed to fetch delivery boys:', error)
      toast.error('Failed to load delivery boys')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingBoy) {
        await updateDeliveryBoy(editingBoy._id, formData)
        toast.success('Delivery boy updated successfully')
      } else {
        await createDeliveryBoy(formData)
        toast.success('Delivery boy created successfully')
      }
      setShowModal(false)
      setEditingBoy(null)
      setFormData({ name: '', email: '', password: '', phone: '' })
      fetchDeliveryBoys()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed')
    }
  }

  const handleEdit = (boy) => {
    setEditingBoy(boy)
    setFormData({
      name: boy.name,
      email: boy.email,
      password: '',
      phone: boy.phone || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this delivery boy?')) {
      try {
        await deleteDeliveryBoy(id)
        toast.success('Delivery boy deleted successfully')
        fetchDeliveryBoys()
      } catch (error) {
        toast.error(error.response?.data?.message || 'Delete failed')
      }
    }
  }

  const handleApproveKYC = async (boy) => {
    try {
      await approveKYC(boy.id || boy._id)
      toast.success('KYC approved successfully')
      fetchDeliveryBoys()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Approval failed')
    }
  }

  const handleRejectKYC = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection')
      return
    }
    try {
      await rejectKYC(selectedBoy.id || selectedBoy._id, rejectionReason)
      toast.success('KYC rejected')
      setShowKycModal(false)
      setRejectionReason('')
      setSelectedBoy(null)
      fetchDeliveryBoys()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Rejection failed')
    }
  }

  const getKycStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="kyc-badge approved">✅ Approved</span>
      case 'rejected':
        return <span className="kyc-badge rejected">❌ Rejected</span>
      case 'pending':
        return <span className="kyc-badge pending">⏳ Pending</span>
      default:
        return <span className="kyc-badge not-uploaded">📄 Not Uploaded</span>
    }
  }

  if (loading) {
    return <div className="loading">Loading delivery boys...</div>
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Delivery Boy Management</h1>
        <button className="btn-primary" onClick={() => {
          setEditingBoy(null)
          setFormData({ name: '', email: '', password: '', phone: '' })
          setShowModal(true)
        }}>
          + Add Delivery Boy
        </button>
      </div>

      <div className="delivery-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>KYC Status</th>
              <th>Online Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {deliveryBoys.map((boy, index) => (
              <tr key={boy.id || boy._id}>
                <td>{index + 1}</td>
                <td>{boy.name}</td>
                <td>{boy.email}</td>
                <td>{boy.phone || '-'}</td>
                <td>
                  <div className="kyc-status">
                    {getKycStatusBadge(boy.kycStatus)}
                    {boy.kycStatus === 'pending' && (
                      <div className="kyc-actions">
                        <button 
                          className="kyc-approve" 
                          onClick={() => handleApproveKYC(boy)}
                        >
                          Approve
                        </button>
                        <button 
                          className="kyc-reject" 
                          onClick={() => {
                            setSelectedBoy(boy)
                            setShowKycModal(true)
                          }}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <span className={`online-status ${boy.isOnline ? 'online' : 'offline'}`}>
                    {boy.isOnline ? '🟢 Online' : '⚫ Offline'}
                  </span>
                </td>
                <td>
                  <button className="edit-btn" onClick={() => handleEdit(boy)}>Edit</button>
                  <button className="delete-btn" onClick={() => handleDelete(boy.id || boy._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingBoy ? 'Edit Delivery Boy' : 'Add Delivery Boy'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              {!editingBoy && (
                <div className="form-group">
                  <label>Password *</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
              )}
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="modal-buttons">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">{editingBoy ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* KYC Rejection Modal */}
      {showKycModal && (
        <div className="modal-overlay" onClick={() => setShowKycModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Reject KYC</h2>
            <p className="modal-subtitle">Please provide a reason for rejecting {selectedBoy?.name}'s KYC</p>
            <div className="form-group">
              <label>Rejection Reason *</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows="4"
                placeholder="Enter reason for rejection..."
                required
              />
            </div>
            <div className="modal-buttons">
              <button type="button" className="btn-secondary" onClick={() => setShowKycModal(false)}>Cancel</button>
              <button type="button" className="btn-danger" onClick={handleRejectKYC}>Confirm Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Delivery