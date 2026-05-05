import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'
import '../../styles/auth/login.css'

// Icons as components for better alignment
const EmailIcon = () => (
    <svg className="input-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22 6L12 13L2 6M22 6C22 5.46957 21.7893 4.96086 21.4142 4.58579C21.0391 4.21071 20.5304 4 20 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6M22 6V18C22 18.5304 21.7893 19.0391 21.4142 19.4142C21.0391 19.7893 20.5304 20 20 20H4C3.46957 20 2.96086 19.7893 2.58579 19.4142C2.21071 19.0391 2 18.5304 2 18V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
)

const PasswordIcon = () => (
    <svg className="input-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 15V17M6 21H18C19.1046 21 20 20.1046 20 19V11C20 9.89543 19.1046 9 18 9H6C4.89543 9 4 9.89543 4 11V19C4 20.1046 4.89543 21 6 21ZM16 9V7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7V9H16Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
)

const EyeIcon = ({ show }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        {!show ? (
            <path d="M15 12C15 12.7956 14.6839 13.5587 14.1213 14.1213C13.5587 14.6839 12.7956 15 12 15C11.2044 15 10.4413 14.6839 9.87868 14.1213C9.31607 13.5587 9 12.7956 9 12C9 11.2044 9.31607 10.4413 9.87868 9.87868C10.4413 9.31607 11.2044 9 12 9C12.7956 9 13.5587 9.31607 14.1213 9.87868C14.6839 10.4413 15 11.2044 15 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
            <path d="M2 2L22 22M9.5 9.5L14.5 14.5M18.5 12.5C18.5 13.5 18.2 14.4 17.7 15.2M6.7 7.5C5.1 8.8 3.9 10.4 3 12C5.6 17 8.5 19 12 19C13.2 19 14.3 18.7 15.4 18.1M6.7 7.5L15.4 18.1M6.7 7.5C8.1 6.5 10 6 12 6C15.5 6 18.4 8 21 12C20.3 13.5 19.4 14.9 18.3 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        )}
    </svg>
)

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [rememberMe, setRememberMe] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()

    // Load saved email if remember me was checked
    useEffect(() => {
        const savedEmail = localStorage.getItem('rememberedEmail')
        if (savedEmail) {
            setEmail(savedEmail)
            setRememberMe(true)
        }
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!email || !password) {
            toast.error('Please enter both email and password')
            return
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            toast.error('Please enter a valid email address')
            return
        }

        setLoading(true)

        const result = await login(email, password)

        if (result.success) {
            toast.success(`Welcome back, ${result.user?.name || 'User'}!`)
            
            // Save email if remember me is checked
            if (rememberMe) {
                localStorage.setItem('rememberedEmail', email)
            } else {
                localStorage.removeItem('rememberedEmail')
            }
            
            // ✅ ONLY ONE REDIRECT LOGIC - User ko dashboard pe bhejo
            if (result.user?.role === 'admin') {
                navigate('/admin')
            } else if (result.user?.role === 'delivery') {
                navigate('/delivery')
            } else {
                navigate('/Home')  // User dashboard
            }
        } else {
            toast.error(result.message || 'Invalid email or password')
        }

        setLoading(false)
    }

    const handleSocialLogin = (provider) => {
        toast.success(`${provider} login coming soon!`)
    }

    return (
        <>
            <Helmet>
                <title>Login | FoodieDash</title>
                <meta name="description" content="Login to your FoodieDash account and enjoy delicious food delivery" />
            </Helmet>

            <div className="login-container">
                <div className="login-card">
                    <div className="login-brand">
                        <div className="brand-logo">
                            <span className="brand-icon">🍕</span>
                        </div>
                        <span className="brand-name">FoodieDash</span>
                    </div>

                    <div className="login-header">
                        <h2>Welcome back</h2>
                        <p className="login-subtitle">Sign in to continue your food journey</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Email Field */}
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
                                    autoFocus
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <div className="input-wrapper">
                                <span className="input-icon">
                                    <PasswordIcon />
                                </span>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
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
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="form-options">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                <span>Remember me</span>
                            </label>
                            <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
                        </div>

                        {/* Login Button */}
                        <button type="submit" className="btn-login" disabled={loading}>
                            {loading ? (
                                <>
                                    <span className="spinner"></span>
                                    <span>Signing in...</span>
                                </>
                            ) : (
                                'Sign in'
                            )}
                        </button>
                    </form>

                    {/* Social Login Divider */}
                    <div className="social-divider">
                        <span>Or continue with</span>
                    </div>

                    {/* Social Login Buttons */}
                    <div className="social-login">
                        <button
                            type="button"
                            className="social-btn google"
                            onClick={() => handleSocialLogin('Google')}
                        >
                            <svg className="social-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            <span>Google</span>
                        </button>
                        <button
                            type="button"
                            className="social-btn facebook"
                            onClick={() => handleSocialLogin('Facebook')}
                        >
                            <svg className="social-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18 2H15C13.6739 2 12.4021 2.52678 11.4645 3.46447C10.5268 4.40215 10 5.67392 10 7V10H7V14H10V22H14V14H17L18 10H14V7C14 6.73478 14.1054 6.48043 14.2929 6.29289C14.4804 6.10536 14.7348 6 15 6H18V2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                            </svg>
                            <span>Facebook</span>
                        </button>
                    </div>

                    {/* Register Link */}
                    <div className="login-footer">
                        <p>
                            Don't have an account? <Link to="/register">Create account</Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Login