import React, { useState, useCallback, useMemo } from 'react'
import './UserCard.css'

const UserCard = ({ user, onBlock, onUnblock, onViewDetails, onSendNotification }) => {
    const [showDetails, setShowDetails] = useState(false)
    const [showBlockModal, setShowBlockModal] = useState(false)
    const [showNotificationModal, setShowNotificationModal] = useState(false)
    const [blockReason, setBlockReason] = useState('')
    const [notificationMessage, setNotificationMessage] = useState('')
    const [isProcessing, setIsProcessing] = useState(false)

    const formatDate = useCallback((dateString) => {
        if (!dateString) return 'N/A'
        const date = new Date(dateString)
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })
    }, [])

    const formatDateTime = useCallback((dateString) => {
        if (!dateString) return 'N/A'
        const date = new Date(dateString)
        return date.toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }, [])

    const getRoleConfig = useCallback((role) => {
        const roleConfigs = {
            user: { class: 'user', icon: '👤', label: 'Customer', color: '#1976d2' },
            admin: { class: 'admin', icon: '👑', label: 'Administrator', color: '#c62828' },
            delivery: { class: 'delivery', icon: '🚚', label: 'Delivery Partner', color: '#2e7d32' },
            moderator: { class: 'moderator', icon: '🛡️', label: 'Moderator', color: '#6f42c1' }
        }
        return roleConfigs[role] || roleConfigs.user
    }, [])

    const getStatusConfig = useCallback((isBlocked) => {
        if (isBlocked) {
            return { class: 'blocked', icon: '🔴', label: 'Blocked', color: '#c62828' }
        }
        return { class: 'active', icon: '🟢', label: 'Active', color: '#2e7d32' }
    }, [])

    const getInitials = useCallback((name) => {
        if (!name) return 'U'
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .substring(0, 2)
    }, [])

    const getRandomColor = useCallback((name) => {
        const colors = ['#ff6b35', '#28a745', '#17a2b8', '#6f42c1', '#fd7e14', '#20c997', '#e83e8c', '#6610f2']
        const index = (name?.length || 0) % colors.length
        return colors[index]
    }, [])

    const roleConfig = getRoleConfig(user.role)
    const statusConfig = getStatusConfig(user.isBlocked)
    const avatarColor = getRandomColor(user.name)

    const isAdmin = useMemo(() => user.role === 'admin', [user.role])
    const canBlock = useMemo(() => !isAdmin && !user.isBlocked, [isAdmin, user.isBlocked])
    const canUnblock = useMemo(() => !isAdmin && user.isBlocked, [isAdmin, user.isBlocked])

    const handleBlockSubmit = useCallback(async () => {
        if (!blockReason.trim()) {
            alert('Please provide a reason for blocking')
            return
        }

        setIsProcessing(true)
        try {
            await onBlock(user._id, blockReason)
            setShowBlockModal(false)
            setBlockReason('')
        } catch (error) {
            console.error('Block failed:', error)
        } finally {
            setIsProcessing(false)
        }
    }, [blockReason, user._id, onBlock])

    const handleUnblock = useCallback(() => {
        if (window.confirm(`Are you sure you want to unblock ${user.name}? They will regain full access to their account.`)) {
            onUnblock(user._id)
        }
    }, [user.name, user._id, onUnblock])

    const handleSendNotification = useCallback(async () => {
        if (!notificationMessage.trim()) {
            alert('Please enter a notification message')
            return
        }

        setIsProcessing(true)
        try {
            await onSendNotification(user._id, notificationMessage)
            setShowNotificationModal(false)
            setNotificationMessage('')
        } catch (error) {
            console.error('Notification failed:', error)
        } finally {
            setIsProcessing(false)
        }
    }, [notificationMessage, user._id, onSendNotification])

    const toggleDetails = useCallback(() => {
        setShowDetails(prev => !prev)
    }, [])

    return (
        <>
            <div className={`user-card ${user.isBlocked ? 'blocked-card' : ''}`}>
                {/* Card Header */}
                <div className="user-card-header">
                    <div className="user-avatar-wrapper">
                        <div className="user-avatar" style={{ background: avatarColor }}>
                            {getInitials(user.name)}
                        </div>
                        {user.isEmailVerified && (
                            <div className="verified-badge" title="Email Verified">
                                ✓
                            </div>
                        )}
                    </div>
                    
                    <div className="user-info">
                        <div className="user-name-section">
                            <h3 className="user-name">{user.name}</h3>
                            {user.isPremium && (
                                <span className="premium-badge" title="Premium Member">⭐ Premium</span>
                            )}
                        </div>
                        <p className="user-email">
                            <span className="email-icon">✉️</span>
                            {user.email}
                        </p>
                        {user.phone && (
                            <p className="user-phone">
                                <span className="phone-icon">📞</span>
                                {user.phone}
                            </p>
                        )}
                    </div>
                    
                    <div className="user-badges">
                        <div className={`role-badge ${roleConfig.class}`} title={`Role: ${roleConfig.label}`}>
                            <span className="badge-icon">{roleConfig.icon}</span>
                            <span className="badge-text">{roleConfig.label}</span>
                        </div>
                        <div className={`status-badge ${statusConfig.class}`} title={`Status: ${statusConfig.label}`}>
                            <span className="badge-icon">{statusConfig.icon}</span>
                            <span className="badge-text">{statusConfig.label}</span>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="user-stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">📦</div>
                        <div className="stat-info">
                            <span className="stat-value">{user.stats?.totalOrders || 0}</span>
                            <span className="stat-label">Total Orders</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">💰</div>
                        <div className="stat-info">
                            <span className="stat-value">₹{(user.stats?.totalSpent || 0).toLocaleString()}</span>
                            <span className="stat-label">Total Spent</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">📊</div>
                        <div className="stat-info">
                            <span className="stat-value">₹{(user.stats?.averageOrderValue || 0).toLocaleString()}</span>
                            <span className="stat-label">Avg Order</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">🎁</div>
                        <div className="stat-info">
                            <span className="stat-value">{user.rewardPoints || 0}</span>
                            <span className="stat-label">Reward Points</span>
                        </div>
                    </div>
                </div>

                {/* Toggle Details Button */}
                <button className="btn-toggle-details" onClick={toggleDetails}>
                    <span className="toggle-icon">{showDetails ? '▲' : '▼'}</span>
                    <span>{showDetails ? 'Less Details' : 'More Details'}</span>
                </button>

                {/* Expanded Details */}
                {showDetails && (
                    <div className="user-card-details">
                        {/* Account Information */}
                        <div className="details-section">
                            <div className="section-header">
                                <h4>
                                    <span className="section-icon">👤</span>
                                    Account Information
                                </h4>
                            </div>
                            <div className="details-grid">
                                <div className="detail-item">
                                    <span className="detail-label">User ID:</span>
                                    <span className="detail-value mono">{user._id}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Joined:</span>
                                    <span className="detail-value">{formatDateTime(user.createdAt)}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Last Active:</span>
                                    <span className="detail-value">{formatDateTime(user.lastActive) || 'N/A'}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Email Verified:</span>
                                    <span className={`detail-value ${user.isEmailVerified ? 'verified' : 'unverified'}`}>
                                        {user.isEmailVerified ? '✅ Verified' : '❌ Not Verified'}
                                    </span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">2FA Enabled:</span>
                                    <span className={`detail-value ${user.twoFactorEnabled ? 'enabled' : 'disabled'}`}>
                                        {user.twoFactorEnabled ? '🔒 Enabled' : '🔓 Disabled'}
                                    </span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Last Updated:</span>
                                    <span className="detail-value">{formatDateTime(user.updatedAt)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Referral Information */}
                        {(user.referralCode || user.referredBy) && (
                            <div className="details-section">
                                <h4>
                                    <span className="section-icon">🔗</span>
                                    Referral Information
                                </h4>
                                <div className="details-grid">
                                    {user.referralCode && (
                                        <div className="detail-item">
                                            <span className="detail-label">Referral Code:</span>
                                            <span className="detail-value referral-code">{user.referralCode}</span>
                                        </div>
                                    )}
                                    {user.referredBy && (
                                        <div className="detail-item">
                                            <span className="detail-label">Referred By:</span>
                                            <span className="detail-value">{user.referredBy.name || 'N/A'}</span>
                                        </div>
                                    )}
                                    {user.referralCount > 0 && (
                                        <div className="detail-item">
                                            <span className="detail-label">Referrals Made:</span>
                                            <span className="detail-value">{user.referralCount} users</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Block Reason */}
                        {user.isBlocked && user.blockReason && (
                            <div className="details-section block-reason">
                                <div className="block-header">
                                    <span className="block-icon">⚠️</span>
                                    <h4>Block Reason</h4>
                                </div>
                                <p>{user.blockReason}</p>
                                {user.blockedAt && (
                                    <div className="block-time">
                                        Blocked on: {formatDateTime(user.blockedAt)}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Devices */}
                        {user.devices && user.devices.length > 0 && (
                            <div className="details-section">
                                <h4>
                                    <span className="section-icon">📱</span>
                                    Connected Devices ({user.devices.length})
                                </h4>
                                <div className="devices-list">
                                    {user.devices.slice(0, 3).map((device, idx) => (
                                        <div className="device-item" key={idx}>
                                            <div className="device-info">
                                                <span className="device-icon">{device.type === 'mobile' ? '📱' : '💻'}</span>
                                                <div className="device-details">
                                                    <span className="device-name">{device.deviceName || 'Unknown Device'}</span>
                                                    <span className="device-os">{device.os || 'N/A'}</span>
                                                </div>
                                            </div>
                                            <div className="device-meta">
                                                <span className="device-date">{formatDate(device.lastUsed)}</span>
                                                {device.isCurrent && <span className="current-badge">Current</span>}
                                            </div>
                                        </div>
                                    ))}
                                    {user.devices.length > 3 && (
                                        <div className="more-devices">
                                            +{user.devices.length - 3} more devices
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Order Summary */}
                        {user.recentOrders && user.recentOrders.length > 0 && (
                            <div className="details-section">
                                <h4>
                                    <span className="section-icon">🛒</span>
                                    Recent Orders
                                </h4>
                                <div className="recent-orders">
                                    {user.recentOrders.slice(0, 3).map((order, idx) => (
                                        <div className="order-summary-item" key={idx}>
                                            <div className="order-info">
                                                <span className="order-id">#{order.orderId}</span>
                                                <span className="order-date">{formatDate(order.createdAt)}</span>
                                            </div>
                                            <div className="order-amount">
                                                ₹{order.amount.toLocaleString()}
                                            </div>
                                            <div className={`order-status status-${order.status}`}>
                                                {order.status}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Card Actions */}
                <div className="user-card-actions">
                    <button className="action-btn view-btn" onClick={() => onViewDetails(user._id)}>
                        <span className="btn-icon">👁️</span>
                        <span>View Details</span>
                    </button>

                    {onSendNotification && (
                        <button className="action-btn notify-btn" onClick={() => setShowNotificationModal(true)}>
                            <span className="btn-icon">📢</span>
                            <span>Notify</span>
                        </button>
                    )}

                    {!isAdmin && (
                        <>
                            {canUnblock && (
                                <button className="action-btn unblock-btn" onClick={handleUnblock}>
                                    <span className="btn-icon">🔓</span>
                                    <span>Unblock</span>
                                </button>
                            )}
                            {canBlock && (
                                <button className="action-btn block-btn" onClick={() => setShowBlockModal(true)}>
                                    <span className="btn-icon">🔒</span>
                                    <span>Block</span>
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Block User Modal */}
            {showBlockModal && (
                <div className="modal-overlay" onClick={() => setShowBlockModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title">
                                <span className="modal-icon">🔒</span>
                                <h2>Block User</h2>
                            </div>
                            <button className="modal-close" onClick={() => setShowBlockModal(false)}>×</button>
                        </div>
                        
                        <p className="modal-subtitle">
                            You are about to block <strong>{user.name}</strong>
                        </p>

                        <div className="form-group">
                            <label htmlFor="blockReason">Reason for Blocking <span className="required">*</span></label>
                            <textarea
                                id="blockReason"
                                value={blockReason}
                                onChange={(e) => setBlockReason(e.target.value)}
                                rows="4"
                                placeholder="Enter detailed reason for blocking this user..."
                                autoFocus
                                className="modal-textarea"
                            />
                        </div>

                        <div className="warning-box">
                            <div className="warning-header">
                                <span className="warning-icon">⚠️</span>
                                <strong>Blocked users will not be able to:</strong>
                            </div>
                            <ul className="warning-list">
                                <li>Place new orders</li>
                                <li>Access their account dashboard</li>
                                <li>Use wallet balance</li>
                                <li>Apply coupons or rewards</li>
                                <li>Leave reviews or ratings</li>
                            </ul>
                        </div>

                        <div className="modal-buttons">
                            <button className="btn-secondary" onClick={() => setShowBlockModal(false)}>
                                Cancel
                            </button>
                            <button className="btn-danger" onClick={handleBlockSubmit} disabled={isProcessing}>
                                {isProcessing ? 'Processing...' : 'Block User'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Send Notification Modal */}
            {showNotificationModal && (
                <div className="modal-overlay" onClick={() => setShowNotificationModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title">
                                <span className="modal-icon">📢</span>
                                <h2>Send Notification</h2>
                            </div>
                            <button className="modal-close" onClick={() => setShowNotificationModal(false)}>×</button>
                        </div>
                        
                        <p className="modal-subtitle">
                            Send notification to <strong>{user.name}</strong>
                        </p>

                        <div className="form-group">
                            <label htmlFor="notificationMessage">Message <span className="required">*</span></label>
                            <textarea
                                id="notificationMessage"
                                value={notificationMessage}
                                onChange={(e) => setNotificationMessage(e.target.value)}
                                rows="4"
                                placeholder="Enter your notification message..."
                                className="modal-textarea"
                            />
                            <span className="input-hint">
                                {notificationMessage.length}/500 characters
                            </span>
                        </div>

                        <div className="modal-buttons">
                            <button className="btn-secondary" onClick={() => setShowNotificationModal(false)}>
                                Cancel
                            </button>
                            <button className="btn-primary" onClick={handleSendNotification} disabled={isProcessing}>
                                {isProcessing ? 'Sending...' : 'Send Notification'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default UserCard