import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getWallet, getRatings, goOnline, goOffline, getAvailability, getShift, setBreak, updateLocation } from '../../services/delivery'
import { updateProfile, changePassword } from '../../services/auth'
import toast from 'react-hot-toast'
import '../../styles/delivery/Profile.css'

const Profile = () => {
  const { user, token, logout } = useAuth()
  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    avatar: user?.avatar || ''
  })
  const [wallet, setWallet] = useState(null)
  const [ratings, setRatings] = useState(null)
  const [availability, setAvailability] = useState({ isOnline: false, isOnBreak: false })
  const [shift, setShift] = useState(null)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' })
  const [isOnline, setIsOnline] = useState(false)

  useEffect(() => {
    fetchProfileData()
    const interval = setInterval(fetchProfileData, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [])

  const fetchProfileData = async () => {
    setLoading(true)
    try {
      const [walletRes, ratingsRes, availabilityRes, shiftRes] = await Promise.all([
        getWallet(),
        getRatings(),
        getAvailability(),
        getShift()
      ])
      setWallet(walletRes.wallet)
      setRatings(ratingsRes)
      setAvailability(availabilityRes)
      setIsOnline(availabilityRes.isOnline || false)
      setShift(shiftRes.shift)
    } catch (error) {
      console.error('Failed to fetch profile data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    try {
      await updateProfile({ name: profileData.name, phone: profileData.phone })
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed')
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    try {
      await changePassword(passwordData.oldPassword, passwordData.newPassword)
      toast.success('Password changed successfully')
      setShowPasswordModal(false)
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Password change failed')
    }
  }

  const handleToggleOnline = async () => {
    try {
      if (isOnline) {
        await goOffline()
        toast.success('You are now offline')
      } else {
        await goOnline()
        toast.success('You are now online')
      }
      setIsOnline(!isOnline)
      fetchProfileData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change status')
    }
  }

  const handleStartBreak = async () => {
    try {
      await setBreak('start')
      toast.success('Break started')
      fetchProfileData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to start break')
    }
  }

  const handleEndBreak = async () => {
    try {
      await setBreak('end')
      toast.success('Break ended')
      fetchProfileData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to end break')
    }
  }

  if (loading) {
    return <div className="loading">Loading profile...</div>
  }

  return (
    <div className="delivery-profile">
      <div className="profile-header">
        <h1>My Profile</h1>
        <div className="online-status-toggle">
          <button 
            className={`online-btn ${isOnline ? 'online' : 'offline'}`}
            onClick={handleToggleOnline}
          >
            {isOnline ? '🟢 Online' : '⚫ Offline'}
          </button>
          {isOnline && (
            <>
              {availability.isOnBreak ? (
                <button className="break-btn" onClick={handleEndBreak}>End Break</button>
              ) : (
                <button className="break-btn" onClick={handleStartBreak}>Take Break</button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="profile-grid">
        {/* Personal Information */}
        <div className="profile-card">
          <h2>Personal Information</h2>
          <form onSubmit={handleUpdateProfile}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={profileData.email} disabled />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              />
            </div>
            <button type="submit" className="btn-primary">Update Profile</button>
          </form>
          <button 
            className="btn-secondary" 
            onClick={() => setShowPasswordModal(true)}
            style={{ marginTop: '15px' }}
          >
            Change Password
          </button>
        </div>

        {/* Wallet & Earnings */}
        <div className="profile-card">
          <h2>Wallet & Earnings</h2>
          <div className="wallet-info">
            <div className="wallet-balance">
              <span>Available Balance:</span>
              <strong>₹{wallet?.balance?.toLocaleString() || 0}</strong>
            </div>
            <div className="wallet-earned">
              <span>Total Earned:</span>
              <strong>₹{wallet?.totalEarned?.toLocaleString() || 0}</strong>
            </div>
            <div className="wallet-withdrawn">
              <span>Total Withdrawn:</span>
              <strong>₹{wallet?.totalWithdrawn?.toLocaleString() || 0}</strong>
            </div>
          </div>
        </div>

        {/* Ratings */}
        <div className="profile-card">
          <h2>Ratings & Reviews</h2>
          <div className="ratings-info">
            <div className="rating-stars">
              <span className="rating-value">{ratings?.averageRating || 0}</span>
              <span className="stars">⭐</span>
            </div>
            <div className="rating-count">
              Based on {ratings?.totalRatings || 0} reviews
            </div>
          </div>
          {ratings?.ratings?.length > 0 && (
            <div className="reviews-list">
              <h3>Recent Reviews</h3>
              {ratings.ratings.slice(0, 3).map((review, index) => (
                <div className="review-item" key={index}>
                  <div className="review-rating">⭐ {review.rating}</div>
                  <div className="review-comment">{review.review}</div>
                  <div className="review-user">- {review.userName}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Shift Timing */}
        {shift && (
          <div className="profile-card">
            <h2>Shift Timing</h2>
            <div className="shift-info">
              <div className="shift-time">
                <span>Start Time:</span>
                <strong>{shift.startTime}</strong>
              </div>
              <div className="shift-time">
                <span>End Time:</span>
                <strong>{shift.endTime}</strong>
              </div>
              <div className="shift-days">
                <span>Working Days:</span>
                <strong>{shift.workingDays?.map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]).join(', ')}</strong>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Change Password</h2>
            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  value={passwordData.oldPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  required
                />
              </div>
              <div className="modal-buttons">
                <button type="button" className="btn-secondary" onClick={() => setShowPasswordModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Change Password</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile