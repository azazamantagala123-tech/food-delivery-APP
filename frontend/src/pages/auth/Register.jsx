import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'
import '../../styles/auth/Register.css'

// SVG Icons for better alignment
const UserIcon = () => (
  <svg className="input-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 21V19C20 16.8 18.2 15 16 15H8C5.8 15 4 16.8 4 19V21M16 7C16 9.2 14.2 11 12 11C9.8 11 8 9.2 8 7C8 4.8 9.8 3 12 3C14.2 3 16 4.8 16 7Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const EmailIcon = () => (
  <svg className="input-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 6L12 13L2 6M22 6C22 5.46957 21.7893 4.96086 21.4142 4.58579C21.0391 4.21071 20.5304 4 20 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6M22 6V18C22 18.5304 21.7893 19.0391 21.4142 19.4142C21.0391 19.7893 20.5304 20 20 20H4C3.46957 20 2.96086 19.7893 2.58579 19.4142C2.21071 19.0391 2 18.5304 2 18V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const LockIcon = () => (
  <svg className="input-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 15V17M6 21H18C19.1046 21 20 20.1046 20 19V11C20 9.89543 19.1046 9 18 9H6C4.89543 9 4 9.89543 4 11V19C4 20.1046 4.89543 21 6 21ZM16 9V7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7V9H16Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const CheckIcon = () => (
  <svg className="input-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const PhoneIcon = () => (
  <svg className="input-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7294C21.7209 20.9845 21.5573 21.2136 21.352 21.4019C21.1467 21.5901 20.9042 21.7335 20.6404 21.8227C20.3766 21.9119 20.0975 21.945 19.82 21.92C16.7428 21.5856 13.787 20.5341 11.17 18.85C8.75001 17.3146 6.67994 15.2446 5.14451 12.825C3.45942 10.207 2.40843 7.25146 2.07451 4.17499C2.04964 3.89769 2.08284 3.61877 2.17205 3.35512C2.26126 3.09146 2.40471 2.84901 2.59294 2.64378C2.78117 2.43854 3.01023 2.27501 3.2653 2.16342C3.52038 2.05184 3.79593 1.99482 4.07451 1.99599H7.07451C7.59412 1.99188 8.09835 2.17066 8.50004 2.49999C8.90173 2.82932 9.17421 3.28762 9.26451 3.79599C9.43584 4.79749 9.76107 5.76388 10.2245 6.65699C10.4352 7.05507 10.525 7.51078 10.4817 7.96095C10.4385 8.41112 10.2646 8.83565 9.98451 9.17799L8.98451 10.418C10.1362 12.5666 11.8289 14.3785 13.8845 15.69L15.0245 14.808C15.4034 14.5402 15.8668 14.4122 16.3318 14.4489C16.7968 14.4855 17.2338 14.6844 17.5645 15.009C18.3264 15.7676 18.9608 16.6423 19.4445 17.6C19.8108 18.383 20.033 19.2279 20.0995 20.093C20.1394 20.6006 19.9803 21.1039 19.66 21.5C19.3397 21.8961 18.8865 22.1533 18.3845 22.22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const EyeIcon = ({ show }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {!show ? (
      <>
        <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </>
    ) : (
      <>
        <path d="M2 2L22 22M9.5 9.5L14.5 14.5M18.5 12.5C18.5 13.5 18.2 14.4 17.7 15.2M6.7 7.5C5.1 8.8 3.9 10.4 3 12C5.6 17 8.5 19 12 19C13.2 19 14.3 18.7 15.4 18.1M6.7 7.5L15.4 18.1M6.7 7.5C8.1 6.5 10 6 12 6C15.5 6 18.4 8 21 12C20.3 13.5 19.4 14.9 18.3 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </>
    )}
  </svg>
)

const Register = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const validateForm = () => {
    if (!name.trim()) {
      toast.error('Please enter your full name')
      return false
    }
    
    if (!email) {
      toast.error('Please enter your email address')
      return false
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address')
      return false
    }
    
    if (!password) {
      toast.error('Please enter a password')
      return false
    }
    
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return false
    }
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return false
    }
    
    if (phone && !/^[6-9]\d{9}$/.test(phone)) {
      toast.error('Please enter a valid 10-digit phone number')
      return false
    }
    
    if (!agreeTerms) {
      toast.error('Please agree to the Terms & Conditions')
      return false
    }
    
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    
    // Role is always 'user' for public registration
    const result = await register({ name, email, password, phone }, 'user')
    
    if (result.success) {
      toast.success('Registration successful! Please login.')
      setTimeout(() => {
        navigate('/login')
      }, 1500)
    } else {
      toast.error(result.message || 'Registration failed. Please try again.')
    }
    
    setLoading(false)
  }

  return (
    <>
      <Helmet>
        <title>Create Account | FoodieDash</title>
        <meta name="description" content="Join FoodieDash - Create your account and start ordering delicious food" />
      </Helmet>

      <div className="register-container">
        <div className="register-card">
          <div className="register-header">
            <div className="brand-logo">
              <span className="brand-icon">🍕</span>
            </div>
            <h2>Create account</h2>
            <p className="register-subtitle">Join us and start your food journey</p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="form-group">
              <label htmlFor="name">Full name</label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <UserIcon />
                </span>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  autoFocus
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <EmailIcon />
                </span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <LockIcon />
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  required
                />
                <button 
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon show={showPassword} />
                </button>
              </div>
              <p className="password-hint">✓ Must be at least 6 characters</p>
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm password</label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <CheckIcon />
                </span>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                />
                <button 
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon show={showConfirmPassword} />
                </button>
              </div>
            </div>

            {/* Phone Number */}
            <div className="form-group">
              <label htmlFor="phone">Phone number (optional)</label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <PhoneIcon />
                </span>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="terms-group">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                />
                <span>
                  I agree to the <Link to="/terms">Terms & Conditions</Link> and 
                  <Link to="/privacy"> Privacy Policy</Link>
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button type="submit" className="btn-register" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  <span>Creating account...</span>
                </>
              ) : (
                'Sign up'
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="register-footer">
            <p>
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </div>

          {/* Note for users about delivery partner registration */}
          <div className="register-note">
            <p className="note-text">
              📝 <strong>Note:</strong> Delivery partner accounts can only be created by admin.
              Please contact support if you're interested in becoming a delivery partner.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default Register