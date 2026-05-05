import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getWallet, getRewards, getSubscription } from '../../services/auth'
import { updateProfile, changePassword } from '../../services/user'  // ✅ Changed from auth to user
import toast from 'react-hot-toast'
import '../../styles/user/Profile.css'

const Profile = () => {
  const { user, logout } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [wallet, setWallet] = useState(null)
  const [rewards, setRewards] = useState(0)
  const [subscription, setSubscription] = useState(null)
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  })
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const [walletRes, rewardsRes, subRes] = await Promise.all([
        getWallet(),
        getRewards(),
        getSubscription()
      ])
      setWallet(walletRes.wallet)
      setRewards(rewardsRes.rewards || 0)
      setSubscription(subRes.subscription)
    } catch (error) {
      console.error('Failed to fetch user data:', error)
    }
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await updateProfile(profileData)
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed')
    } finally {
      setLoading(false)
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
    setLoading(true)
    try {
      await changePassword(passwordData.oldPassword, passwordData.newPassword)
      toast.success('Password changed successfully')
      setShowPasswordModal(false)
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Password change failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="profile-container">
      <div className="container">
        <h1>My Profile</h1>
        
        <div className="profile-grid">
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
                <label>Email Address</label>
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
              <button type="submit" className="btn-primary" disabled={loading}>
                Update Profile
              </button>
            </form>
            <button 
              className="btn-secondary" 
              onClick={() => setShowPasswordModal(true)}
              style={{ marginTop: '15px' }}
            >
              Change Password
            </button>
          </div>

          <div className="profile-card">
            <h2>Wallet & Rewards</h2>
            <div className="wallet-info">
              <div className="wallet-balance">
                <span>Wallet Balance</span>
                <strong>₹{wallet?.balance?.toLocaleString() || 0}</strong>
              </div>
              <div className="rewards-points">
                <span>Reward Points</span>
                <strong>{rewards} pts</strong>
              </div>
              <button 
                className="btn-add-money"
                onClick={() => window.location.href = '/wallet'}
              >
                Add Money
              </button>
            </div>
          </div>

          <div className="profile-card">
            <h2>Subscription</h2>
            <div className="subscription-info">
              <div className="plan-name">
                <span>Current Plan</span>
                <strong>{subscription?.plan || 'Free'}</strong>
              </div>
              {subscription?.plan !== 'premium' && (
                <button 
                  className="btn-upgrade"
                  onClick={() => window.location.href = '/subscription'}
                >
                  Upgrade to Premium
                </button>
              )}
            </div>
          </div>

          <div className="profile-card">
            <h2>Quick Stats</h2>
            <div className="stats-list">
              <div className="stat-item">
                <span>Member Since</span>
                <strong>{new Date(user?.createdAt).toLocaleDateString()}</strong>
              </div>
              <div className="stat-item">
                <span>Account Status</span>
                <strong className="status-active">Active</strong>
              </div>
              <button className="btn-logout" onClick={logout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

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
                <button type="submit" className="btn-primary" disabled={loading}>Change Password</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile