import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import api from '../../services/api'
import '../../styles/auth/ForgotPassword.css'

const ForgotPassword = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetToken, setResetToken] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [resendCountdown, setResendCountdown] = useState(0)

  const handleSendOTP = async (e) => {
    e.preventDefault()
    if (!email) {
      toast.error('Please enter your email address')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address')
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/auth/forgot-password', { email })
      if (response.data.success) {
        toast.success('OTP sent successfully to your email')
        setStep(2)
        startResendCountdown()
      } else {
        toast.error(response.data.message || 'Failed to send OTP')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP')
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/auth/verify-reset-otp', { email, otp })
      if (response.data.success) {
        toast.success('OTP verified successfully')
        setResetToken(response.data.resetToken)
        setStep(3)
      } else {
        toast.error(response.data.message || 'Invalid OTP')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'OTP verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    
    if (!newPassword || !confirmPassword) {
      toast.error('Please enter new password')
      return
    }
    
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/auth/reset-password', {
        resetToken,
        newPassword
      })
      if (response.data.success) {
        toast.success('Password reset successfully! Please login with your new password.')
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      } else {
        toast.error(response.data.message || 'Password reset failed')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Password reset failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (resendCountdown > 0) return
    
    setLoading(true)
    try {
      const response = await api.post('/auth/resend-otp', { email })
      if (response.data.success) {
        toast.success('OTP resent successfully')
        startResendCountdown()
      } else {
        toast.error(response.data.message || 'Failed to resend OTP')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP')
    } finally {
      setLoading(false)
    }
  }

  const startResendCountdown = () => {
    setResendCountdown(60)
    const timer = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const goBack = () => {
    if (step > 1) {
      setStep(step - 1)
    } else {
      navigate('/login')
    }
  }

  return (
    <>
      <Helmet>
        <title>Forgot Password | Food Delivery</title>
        <meta name="description" content="Reset your password" />
      </Helmet>

      <div className="auth-container">
        <div className="auth-card">
          <button className="back-btn" onClick={goBack}>
            ← Back
          </button>
          
          <div className="auth-header">
            <h2>Forgot Password?</h2>
            <p className="auth-subtitle">
              {step === 1 && 'Enter your email to receive OTP'}
              {step === 2 && 'Enter the 6-digit OTP sent to your email'}
              {step === 3 && 'Create a new password'}
            </p>
          </div>

          <div className="step-indicator">
            <div className={`step ${step >= 1 ? 'active' : ''}`}>
              <span className="step-number">1</span>
              <span className="step-label">Email</span>
            </div>
            <div className={`step-line ${step >= 2 ? 'active' : ''}`}></div>
            <div className={`step ${step >= 2 ? 'active' : ''}`}>
              <span className="step-number">2</span>
              <span className="step-label">Verify</span>
            </div>
            <div className={`step-line ${step >= 3 ? 'active' : ''}`}></div>
            <div className={`step ${step >= 3 ? 'active' : ''}`}>
              <span className="step-number">3</span>
              <span className="step-label">Reset</span>
            </div>
          </div>

          {/* Step 1: Email */}
          {step === 1 && (
            <form onSubmit={handleSendOTP}>
              <div className="form-group">
                <label>Email Address</label>
                <div className="input-icon">
                  <span className="icon">📧</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    autoFocus
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn-auth" disabled={loading}>
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <form onSubmit={handleVerifyOTP}>
              <div className="form-group">
                <label>OTP Code</label>
                <div className="input-icon">
                  <span className="icon">🔐</span>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    autoFocus
                    required
                  />
                </div>
                <p className="otp-hint">
                  OTP sent to <strong>{email}</strong>
                </p>
              </div>
              <button type="submit" className="btn-auth" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
              <button 
                type="button" 
                className="btn-link" 
                onClick={handleResendOTP}
                disabled={resendCountdown > 0 || loading}
              >
                {resendCountdown > 0 
                  ? `Resend OTP in ${resendCountdown}s` 
                  : 'Resend OTP'}
              </button>
            </form>
          )}

          {/* Step 3: Reset Password */}
          {step === 3 && (
            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <label>New Password</label>
                <div className="input-icon">
                  <span className="icon">🔒</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    autoFocus
                    required
                  />
                  <button 
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                <p className="password-hint">Password must be at least 6 characters</p>
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <div className="input-icon">
                  <span className="icon">✓</span>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                  />
                  <button 
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn-auth" disabled={loading}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}

          <div className="auth-footer">
            <Link to="/login">Back to Login</Link>
          </div>
        </div>
      </div>
    </>
  )
}

export default ForgotPassword