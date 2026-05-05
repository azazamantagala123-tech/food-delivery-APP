import React, { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import '../styles/landing.css'

// ===================== DATA =====================
const FEATURES = [
  {
    num: '01',
    icon: '🚚',
    title: 'Lightning Delivery',
    desc: 'Fresh food at your door in under 30 minutes, guaranteed hot and ready to eat.',
  },
  {
    num: '02',
    icon: '🥘',
    title: 'Premium Quality',
    desc: 'Curated restaurants with top-rated chefs using only fresh, quality ingredients.',
  },
  {
    num: '03',
    icon: '💸',
    title: 'Best Prices',
    desc: 'Daily deals and exclusive member offers that keep your wallet happy.',
  },
  {
    num: '04',
    icon: '⭐',
    title: 'Top Rated',
    desc: '4.8 stars across 10,000+ verified customer reviews across India.',
  },
]

const STEPS = [
  {
    n: '1',
    title: 'Browse & Pick',
    desc: 'Explore hundreds of restaurants and cuisines near you. Filter by rating, cuisine, or delivery time.',
  },
  {
    n: '2',
    title: 'Place Order',
    desc: 'Easy checkout with multiple payment options — UPI, card, wallet, or cash on delivery.',
  },
  {
    n: '3',
    title: 'Enjoy!',
    desc: 'Your food arrives hot, fresh, and on time. Track your order live on the map.',
  },
]

const STATS = [
  { val: '500+',  lab: 'Restaurants' },
  { val: '10k+',  lab: 'Happy Customers' },
  { val: '28min', lab: 'Avg Delivery' },
  { val: '24/7',  lab: 'Support' },
]

const TESTIMONIALS = [
  {
    name: 'Rahul Kumar',
    role: 'Regular Customer',
    initials: 'RK',
    text: 'Honestly the best food delivery app I\'ve used. My order was at the door in 25 minutes, still piping hot!',
  },
  {
    name: 'Priya Singh',
    role: 'Food Enthusiast',
    initials: 'PS',
    text: 'Love the variety of restaurants. Quality is consistently great and the prices are very reasonable.',
  },
  {
    name: 'Amit Verma',
    role: 'Premium Member',
    initials: 'AV',
    text: 'Been using FoodieDash for 6 months. Never disappointed once. Highly recommended to everyone!',
  },
]

const MARQUEE_ITEMS = [
  'Fast Delivery', '500+ Restaurants', 'Fresh Ingredients',
  'Best Prices', 'Top Rated', 'Order Anytime',
  '30 Min Delivery', 'Happy Customers', 'Live Tracking',
]

// ===================== COMPONENT =====================
const Landing = () => {
  const [scrolled, setScrolled]           = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const revealRefs                         = useRef([])

  /* ---------- Scroll: navbar shrink + reveal animations ---------- */
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 60)

      revealRefs.current.forEach((el) => {
        if (!el) return
        const { top } = el.getBoundingClientRect()
        if (top < window.innerHeight - 80) {
          el.classList.add('visible')
        }
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll() // trigger once on mount
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* ---------- Close mobile menu on resize ---------- */
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 768) setMobileMenuOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  /* ---------- Helper: push element into reveal tracker ---------- */
  const addReveal = (el) => {
    if (el && !revealRefs.current.includes(el)) {
      revealRefs.current.push(el)
    }
  }

  /* ---------- Marquee: duplicate items for seamless loop ---------- */
  const marqueeItems = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS]

  return (
    <div className="landing">

      {/* ==================== NAVBAR ==================== */}
      <nav className={`landing-nav ${scrolled ? 'scrolled' : ''}`}>
        <Link to="/" className="logo">
          <span className="logo-dot" />
          FoodieDash
        </Link>

        {/* Desktop Buttons */}
        <div className="nav-btns">
          <Link to="/login"    className="btn-login">Login</Link>
          <Link to="/register" className="btn-register">Sign/Up</Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </nav>

      {/* Mobile Dropdown */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <Link to="/login"    className="btn-login"    onClick={() => setMobileMenuOpen(false)}>Login</Link>
        <Link to="/register" className="btn-register" onClick={() => setMobileMenuOpen(false)}>Sign Up</Link>
      </div>

      {/* ==================== HERO ==================== */}
      <section className="hero">
        <div className="hero-glow-1" />
        <div className="hero-glow-2" />

        <div className="hero-inner">
          {/* Text */}
          <div className="hero-text">
            <div className="hero-label">
              <span className="hero-label-dot" />
              Now delivering in your area
            </div>

            <h1 className="hero-title">
              Food You Love,<br />
              Delivered <span className="accent">Fast.</span>
            </h1>

            <p className="hero-subtitle">
              Order from 500+ top restaurants near you. Fresh ingredients, expert
              chefs, doorstep delivery in under 30 minutes.
            </p>

            <div className="hero-actions">
              <Link to="/login" className="btn-primary">Order Now</Link>
              <a
                href="#features"
                className="btn-outline"
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                Explore Menu
              </a>
            </div>
          </div>

          {/* Visual Card */}
          <div className="hero-visual">
            <div className="badge-float top-badge">
              <span className="badge-indicator green" />
              Delivery in 28 min
            </div>

            <div className="food-card-main">
              <span className="food-emoji-large">🍕</span>
              <h3>Margherita Pizza</h3>
              <p>Classic tomato, mozzarella</p>
              <div className="food-meta">
                <span className="food-price">₹349</span>
                <button className="add-btn">+</button>
              </div>
            </div>

            <div className="badge-float bottom-badge">
              <span className="badge-indicator orange" />
              500+ restaurants
            </div>
          </div>
        </div>
      </section>

      {/* ==================== MARQUEE STRIP ==================== */}
      <div className="marquee-section">
        <div className="marquee-track">
          {marqueeItems.map((item, i) => (
            <div className="marquee-item" key={i}>
              <span className="marquee-divider">✦</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ==================== FEATURES ==================== */}
      <section className="features-section" id="features">
        <div
          className="section-header reveal"
          ref={addReveal}
        >
          <div className="section-tag">Why Us</div>
          <h2 className="section-title">
            Everything You Need,<br />Nothing You Don't
          </h2>
        </div>

        <div className="features-grid container">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="feature-card reveal"
              ref={addReveal}
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <div className="feature-num">{f.num}</div>
              <span className="feature-icon">{f.icon}</span>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== HOW IT WORKS ==================== */}
      <section className="how-it-works" id="how">
        <div className="section-header reveal" ref={addReveal}>
          <div className="section-tag">How It Works</div>
          <h2 className="section-title">
            Three Steps to<br />Delicious
          </h2>
        </div>

        <div className="steps-grid container">
          {STEPS.map((s, i) => (
            <div
              key={i}
              className="step-card reveal"
              ref={addReveal}
              style={{ transitionDelay: `${i * 0.15}s` }}
            >
              {i < STEPS.length - 1 && <span className="step-arrow">→</span>}
              <div className="step-number">{s.n}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== STATS ==================== */}
      <section className="stats-section">
        <div className="stats-grid">
          {STATS.map((s, i) => (
            <div
              key={i}
              className="stat-card reveal"
              ref={addReveal}
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <div className="stat-value">{s.val}</div>
              <div className="stat-label">{s.lab}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== TESTIMONIALS ==================== */}
      <section className="testimonials-section">
        <div className="section-header reveal" ref={addReveal}>
          <div className="section-tag">Testimonials</div>
          <h2 className="section-title">Loved by Thousands</h2>
        </div>

        <div className="testimonials-grid container">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={i}
              className="testimonial-card reveal"
              ref={addReveal}
              style={{ transitionDelay: `${i * 0.15}s` }}
            >
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">"{t.text}"</p>
              <div className="testimonial-author">
                <div className="author-avatar">{t.initials}</div>
                <div>
                  <div className="author-name">{t.name}</div>
                  <div className="author-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== CTA ==================== */}
      <section className="cta-section">
        <div className="cta-glow" />
        <h2 className="reveal" ref={addReveal}>
          Ready to<br />Order?
        </h2>
        <p className="reveal reveal-delay-1" ref={addReveal}>
          Join 10,000+ happy customers today.
        </p>
        <Link
          to="/login"
          className="btn-cta"
          ref={addReveal}
        >
          Get Started →
        </Link>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="footer">
        <div className="footer-top">
          {/* Brand */}
          <div>
            <div className="footer-logo">
              <span className="footer-logo-dot" />
              FoodieDash
            </div>
            <p className="footer-desc">
              Delivering happiness to your doorstep since 2024. Fresh food, fast.
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h5>Quick Links</h5>
            <Link to="/">Home</Link>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </div>

          {/* Contact */}
          <div className="footer-col">
            <h5>Contact</h5>
            <span>support@foodiedash.com</span>
            <span>+91 98765 43210</span>
          </div>

          {/* Social */}
          <div className="footer-col">
            <h5>Follow Us</h5>
            <a href="#" aria-label="Instagram">Instagram</a>
            <a href="#" aria-label="Twitter">Twitter</a>
            <a href="#" aria-label="Facebook">Facebook</a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2024 FoodieDash. All rights reserved.</p>
          <p>Made with love in India 🇮🇳</p>
        </div>
      </footer>

    </div>
  )
}

export default Landing