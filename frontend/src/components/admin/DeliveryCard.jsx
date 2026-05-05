import React, { useState, useCallback, memo } from 'react'
import './DeliveryCard.css'

// Icon Components for better alignment
const PhoneIcon = () => (
  <svg className="info-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
)

const LocationIcon = () => (
  <svg className="info-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
)

const StarIcon = () => (
  <svg className="info-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)

const DeliveryIcon = () => (
  <svg className="info-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="1" y="3" width="15" height="13"/>
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
    <circle cx="5.5" cy="18.5" r="2.5"/>
    <circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
)

const WalletIcon = () => (
  <svg className="info-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v3z"/>
    <path d="M19 12h-4a2 2 0 1 0 0 4h4"/>
  </svg>
)

const DeliveryCard = memo(({ delivery, onApproveKYC, onRejectKYC, onEdit, onDelete }) => {
  const [showDetails, setShowDetails] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const getStatusBadge = useCallback((status) => {
    const statusConfig = {
      approved: { class: 'approved', text: 'Approved', icon: '✅', description: 'KYC verified successfully' },
      rejected: { class: 'rejected', text: 'Rejected', icon: '❌', description: 'KYC verification failed' },
      pending: { class: 'pending', text: 'Pending', icon: '⏳', description: 'Awaiting verification' },
      not_uploaded: { class: 'not-uploaded', text: 'Not Uploaded', icon: '📄', description: 'Documents not submitted' }
    }
    const config = statusConfig[status] || statusConfig.not_uploaded
    return (
      <div className={`kyc-badge ${config.class}`} title={config.description}>
        <span className="badge-icon">{config.icon}</span>
        <span className="badge-text">{config.text}</span>
      </div>
    )
  }, [])

  const getOnlineStatus = useCallback((isOnline, isOnBreak) => {
    if (isOnBreak) {
      return { class: 'on-break', text: 'On Break', icon: '⏸️', color: '#ffc107' }
    }
    if (isOnline) {
      return { class: 'online', text: 'Online', icon: '🟢', color: '#28a745' }
    }
    return { class: 'offline', text: 'Offline', icon: '⚫', color: '#6c757d' }
  }, [])

  const handleRejectSubmit = useCallback(async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection')
      return
    }
    
    setIsLoading(true)
    try {
      await onRejectKYC(delivery.id || delivery._id, rejectionReason)
      setShowRejectModal(false)
      setRejectionReason('')
      toast.success('KYC rejected successfully')
    } catch (error) {
      toast.error('Failed to reject KYC')
    } finally {
      setIsLoading(false)
    }
  }, [delivery.id, delivery._id, rejectionReason, onRejectKYC])

  const handleApproveKYC = useCallback(async (e) => {
    e.stopPropagation()
    if (window.confirm(`Are you sure you want to approve ${delivery.name}'s KYC?`)) {
      setIsLoading(true)
      try {
        await onApproveKYC(delivery.id || delivery._id)
        toast.success('KYC approved successfully')
      } catch (error) {
        toast.error('Failed to approve KYC')
      } finally {
        setIsLoading(false)
      }
    }
  }, [delivery.id, delivery._id, delivery.name, onApproveKYC])

  const handleEdit = useCallback((e) => {
    e.stopPropagation()
    onEdit(delivery)
  }, [delivery, onEdit])

  const handleDelete = useCallback((e) => {
    e.stopPropagation()
    if (window.confirm(`Are you sure you want to delete ${delivery.name}? This action cannot be undone.`)) {
      onDelete(delivery.id || delivery._id)
    }
  }, [delivery.id, delivery._id, delivery.name, onDelete])

  const onlineStatus = getOnlineStatus(delivery.isOnline, delivery.isOnBreak)

  return (
    <>
      <div className={`delivery-card ${showDetails ? 'expanded' : ''}`}>
        {/* Card Header */}
        <div className="delivery-card-header" onClick={() => setShowDetails(!showDetails)}>
          <div className="delivery-avatar-wrapper">
            <div className="delivery-avatar">
              {delivery.name?.charAt(0) || 'D'}
            </div>
            <div className={`status-indicator ${onlineStatus.class}`}></div>
          </div>
          
          <div className="delivery-info">
            <h3 className="delivery-name">{delivery.name}</h3>
            <p className="delivery-email">{delivery.email}</p>
            {delivery.phone && (
              <div className="delivery-phone-mobile">
                <PhoneIcon />
                <span>{delivery.phone}</span>
              </div>
            )}
          </div>
          
          <div className="delivery-status-badges">
            <div className={`online-status ${onlineStatus.class}`}>
              <span className="status-icon">{onlineStatus.icon}</span>
              <span className="status-text">{onlineStatus.text}</span>
            </div>
            {getStatusBadge(delivery.kycStatus)}
            <button className="expand-btn" aria-label={showDetails ? 'Show less' : 'Show more'}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points={showDetails ? "18 15 12 9 6 15" : "6 9 12 15 18 9"} />
              </svg>
            </button>
          </div>
        </div>

        {/* Card Stats Grid */}
        <div className="delivery-stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-info">
              <span className="stat-value">{delivery.stats?.totalDeliveries || 0}</span>
              <span className="stat-label">Total Deliveries</span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <span className="stat-value">₹{(delivery.stats?.totalEarnings || 0).toLocaleString()}</span>
              <span className="stat-label">Total Earnings</span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">👛</div>
            <div className="stat-info">
              <span className="stat-value">₹{(delivery.stats?.walletBalance || 0).toLocaleString()}</span>
              <span className="stat-label">Wallet Balance</span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-info">
              <span className="stat-value">{delivery.averageRating || 0}</span>
              <span className="stat-label">
                Rating ({delivery.totalRatings || 0} reviews)
              </span>
            </div>
          </div>
        </div>

        {/* Expanded Details */}
        {showDetails && (
          <div className="delivery-card-details">
            {/* KYC Documents Section */}
            <div className="details-section">
              <div className="section-header">
                <h4>📄 KYC Documents</h4>
                {delivery.kycStatus === 'pending' && (
                  <div className="section-actions">
                    <button className="btn-approve-sm" onClick={handleApproveKYC} disabled={isLoading}>
                      ✅ Approve
                    </button>
                    <button className="btn-reject-sm" onClick={() => setShowRejectModal(true)} disabled={isLoading}>
                      ❌ Reject
                    </button>
                  </div>
                )}
              </div>
              
              <div className="kyc-docs-grid">
                <div className="kyc-doc-card">
                  <div className="doc-icon">🆔</div>
                  <div className="doc-info">
                    <span className="doc-label">Aadhaar Card</span>
                    {delivery.kycDocs?.aadhaar ? (
                      <a href={delivery.kycDocs.aadhaar} target="_blank" rel="noopener noreferrer" className="doc-link">
                        View Document →
                      </a>
                    ) : (
                      <span className="doc-not-uploaded">Not uploaded</span>
                    )}
                  </div>
                </div>
                
                <div className="kyc-doc-card">
                  <div className="doc-icon">📇</div>
                  <div className="doc-info">
                    <span className="doc-label">PAN Card</span>
                    {delivery.kycDocs?.panCard ? (
                      <a href={delivery.kycDocs.panCard} target="_blank" rel="noopener noreferrer" className="doc-link">
                        View Document →
                      </a>
                    ) : (
                      <span className="doc-not-uploaded">Not uploaded</span>
                    )}
                  </div>
                </div>
                
                <div className="kyc-doc-card">
                  <div className="doc-icon">🚗</div>
                  <div className="doc-info">
                    <span className="doc-label">Driving License</span>
                    {delivery.kycDocs?.license ? (
                      <a href={delivery.kycDocs.license} target="_blank" rel="noopener noreferrer" className="doc-link">
                        View Document →
                      </a>
                    ) : (
                      <span className="doc-not-uploaded">Not uploaded</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Rejection Reason */}
            {delivery.kycRejectReason && (
              <div className="details-section rejection-reason">
                <div className="rejection-header">
                  <span className="rejection-icon">⚠️</span>
                  <h4>Rejection Reason</h4>
                </div>
                <p>{delivery.kycRejectReason}</p>
              </div>
            )}

            {/* Contact & Location */}
            <div className="details-two-columns">
              <div className="details-section">
                <h4>📞 Contact Information</h4>
                <div className="contact-info">
                  <div className="contact-item">
                    <PhoneIcon />
                    <span>{delivery.phone || 'Not provided'}</span>
                  </div>
                  <div className="contact-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    <span>{delivery.email}</span>
                  </div>
                </div>
              </div>

              <div className="details-section">
                <h4>📍 Current Location</h4>
                <div className="location-info">
                  <div className="location-item">
                    <span className="location-label">Latitude:</span>
                    <span>{delivery.currentLocation?.latitude || 'N/A'}</span>
                  </div>
                  <div className="location-item">
                    <span className="location-label">Longitude:</span>
                    <span>{delivery.currentLocation?.longitude || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="details-footer">
              <div className="info-item">
                <span className="info-label">Joined on:</span>
                <span className="info-value">
                  {new Date(delivery.createdAt).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Last active:</span>
                <span className="info-value">
                  {delivery.lastActive ? new Date(delivery.lastActive).toLocaleString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="delivery-card-actions">
          <button 
            className="action-btn edit-btn"
            onClick={handleEdit}
            title="Edit delivery partner details"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"/>
              <polygon points="18 2 22 6 12 16 8 16 8 12 18 2"/>
            </svg>
            <span>Edit</span>
          </button>
          
          <button 
            className="action-btn delete-btn"
            onClick={handleDelete}
            title="Delete delivery partner"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              <line x1="10" y1="11" x2="10" y2="17"/>
              <line x1="14" y1="11" x2="14" y2="17"/>
            </svg>
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Reject KYC Modal */}
      {showRejectModal && (
        <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon">❌</div>
              <h2>Reject KYC Verification</h2>
            </div>
            <p className="modal-subtitle">
              Please provide a reason for rejecting <strong>{delivery.name}</strong>'s KYC documents
            </p>
            
            <div className="modal-form-group">
              <label htmlFor="rejectionReason">Rejection Reason *</label>
              <textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows="4"
                placeholder="Enter detailed reason for rejection..."
                autoFocus
                className="modal-textarea"
              />
              <span className="input-hint">This reason will be visible to the delivery partner</span>
            </div>
            
            <div className="modal-buttons">
              <button 
                className="btn-secondary" 
                onClick={() => setShowRejectModal(false)}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button 
                className="btn-danger" 
                onClick={handleRejectSubmit}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
})

DeliveryCard.displayName = 'DeliveryCard'

export default DeliveryCard