import React from 'react'
import { Link } from 'react-router-dom'
import './Footer.css'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    company: [
      { name: 'About Us', path: '/about' },
      { name: 'Careers', path: '/careers' },
      { name: 'Blog', path: '/blog' },
      { name: 'Press', path: '/press' }
    ],
    support: [
      { name: 'Help Center', path: '/help' },
      { name: 'Contact Us', path: '/contact' },
      { name: 'FAQs', path: '/faqs' },
      { name: 'Shipping Info', path: '/shipping' }
    ],
    legal: [
      { name: 'Terms of Service', path: '/terms' },
      { name: 'Privacy Policy', path: '/privacy' },
      { name: 'Refund Policy', path: '/refund' },
      { name: 'Cookie Policy', path: '/cookie' }
    ],
    popular: [
      { name: 'Pizza', path: '/category/pizza' },
      { name: 'Biryani', path: '/category/biryani' },
      { name: 'Burger', path: '/category/burger' },
      { name: 'Desserts', path: '/category/desserts' }
    ]
  }

  const socialLinks = [
    { name: 'Facebook', icon: '📘', url: 'https://facebook.com', color: '#1877f2' },
    { name: 'Instagram', icon: '📸', url: 'https://instagram.com', color: '#e4405f' },
    { name: 'Twitter', icon: '🐦', url: 'https://twitter.com', color: '#1da1f2' },
    { name: 'YouTube', icon: '📺', url: 'https://youtube.com', color: '#ff0000' },
    { name: 'LinkedIn', icon: '🔗', url: 'https://linkedin.com', color: '#0077b5' }
  ]

  const appLinks = [
    { name: 'Google Play', icon: '📱', url: 'https://play.google.com' },
    { name: 'App Store', icon: '🍎', url: 'https://apple.com/app-store' }
  ]

  const paymentMethods = [
    { name: 'Visa', icon: '💳' },
    { name: 'Mastercard', icon: '💳' },
    { name: 'Razorpay', icon: '💰' },
    { name: 'PayTM', icon: '📱' },
    { name: 'Google Pay', icon: '📱' },
    { name: 'PhonePe', icon: '📱' }
  ]

  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="container">
          <div className="footer-grid">
            {/* Brand Column */}
            <div className="footer-col brand-col">
              <div className="footer-logo">
                <span className="logo-icon">🍕</span>
                <span className="logo-text">FoodieDash</span>
              </div>
              <p className="footer-description">
                Delivering happiness to your doorstep since 2024. 
                We connect you with the best restaurants in town.
              </p>
              <div className="footer-contact">
                <div className="contact-item">
                  <span className="contact-icon">📞</span>
                  <span>+91 98765 43210</span>
                </div>
                <div className="contact-item">
                  <span className="contact-icon">✉️</span>
                  <span>support@foodiedash.com</span>
                </div>
                <div className="contact-item">
                  <span className="contact-icon">📍</span>
                  <span>Jaipur, Rajasthan, India</span>
                </div>
              </div>
            </div>

            {/* Company Links */}
            <div className="footer-col">
              <h3 className="footer-title">Company</h3>
              <ul className="footer-links">
                {footerLinks.company.map((link, index) => (
                  <li key={index}>
                    <Link to={link.path}>{link.name}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div className="footer-col">
              <h3 className="footer-title">Support</h3>
              <ul className="footer-links">
                {footerLinks.support.map((link, index) => (
                  <li key={index}>
                    <Link to={link.path}>{link.name}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Popular Categories */}
            <div className="footer-col">
              <h3 className="footer-title">Popular</h3>
              <ul className="footer-links">
                {footerLinks.popular.map((link, index) => (
                  <li key={index}>
                    <Link to={link.path}>{link.name}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div className="footer-col">
              <h3 className="footer-title">Legal</h3>
              <ul className="footer-links">
                {footerLinks.legal.map((link, index) => (
                  <li key={index}>
                    <Link to={link.path}>{link.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-middle">
        <div className="container">
          <div className="footer-middle-content">
            <div className="social-section">
              <h4>Follow Us</h4>
              <div className="social-links">
                {socialLinks.map((social, index) => (
                  <a 
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link"
                    style={{ '--social-color': social.color }}
                    aria-label={social.name}
                  >
                    <span className="social-icon">{social.icon}</span>
                  </a>
                ))}
              </div>
            </div>

            <div className="app-section">
              <h4>Download App</h4>
              <div className="app-links">
                {appLinks.map((app, index) => (
                  <a 
                    key={index}
                    href={app.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="app-link"
                  >
                    <span className="app-icon">{app.icon}</span>
                    <span>{app.name}</span>
                  </a>
                ))}
              </div>
            </div>

            <div className="payment-section">
              <h4>Payment Methods</h4>
              <div className="payment-icons">
                {paymentMethods.map((method, index) => (
                  <span key={index} className="payment-icon" title={method.name}>
                    {method.icon}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-content">
            <p className="copyright">
              &copy; {currentYear} FoodieDash. All rights reserved.
            </p>
            <div className="footer-bottom-links">
              <Link to="/sitemap">Sitemap</Link>
              <Link to="/accessibility">Accessibility</Link>
              <Link to="/feedback">Feedback</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer