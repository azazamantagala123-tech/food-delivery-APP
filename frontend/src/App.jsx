import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'

// Public Pages
import Landing from './pages/Landing'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'

// User Layout + Pages
import UserLayout from './layouts/UserLayout'
import UserHome from './pages/user/Home'
import UserDashboard from './pages/user/Dashboard'
import UserProfile from './pages/user/Profile'
import UserCart from './pages/user/Cart'
import UserOrders from './pages/user/Orders'
import UserFavorites from './pages/user/Favorites'
import UserWallet from './pages/user/Wallet'
import UserCheckout from './pages/user/Checkout'
import FoodDetails from './pages/user/FoodDetails'

// ✅ Admin Layout (NEW)
import AdminLayout from './layouts/AdminLayout'

// ✅ Admin Pages (No need header/sidebar in each page now)
import AdminDashboard from './pages/admin/Dashboard'
import AdminFoods from './pages/admin/Foods'
import AdminOrders from './pages/admin/Orders'
import AdminUsers from './pages/admin/Users'
import AdminDelivery from './pages/admin/Delivery'
import AdminCoupons from './pages/admin/Coupons'
import AdminCategories from './pages/admin/Categories'
import AdminReports from './pages/admin/Reports'
import AdminSettings from './pages/admin/Settings'

// Delivery Pages
import DeliveryLayout from './pages/delivery/DeliveryLayout'
import DeliveryDashboard from './pages/delivery/Dashboard'
import DeliveryOrders from './pages/delivery/Orders'
import DeliveryHistory from './pages/delivery/History'
import DeliveryEarnings from './pages/delivery/Earnings'
import DeliveryProfile from './pages/delivery/Profile'
import DeliverySupport from './pages/delivery/Support'

// ==================== Protected Route ====================
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <div className="loading">Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />
    if (user.role === 'delivery') return <Navigate to="/delivery" replace />
    return <Navigate to="/home" replace />
  }

  return children
}

// ==================== Public Route ====================
const PublicRoute = ({ children }) => {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <div className="loading">Loading...</div>
  }

  if (user) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />
    if (user.role === 'delivery') return <Navigate to="/delivery" replace />
    return <Navigate to="/home" replace />
  }

  return children
}

// ==================== App ====================
function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />

      {/* ================= USER ROUTES ================= */}
      <Route element={<ProtectedRoute allowedRoles={['user']}><UserLayout /></ProtectedRoute>}>
        <Route path="/home" element={<UserHome />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/cart" element={<UserCart />} />
        <Route path="/checkout" element={<UserCheckout />} />
        <Route path="/orders" element={<UserOrders />} />
        <Route path="/favorites" element={<UserFavorites />} />
        <Route path="/wallet" element={<UserWallet />} />
        <Route path="/food/:id" element={<FoodDetails />} />
      </Route>

      {/* ================= ADMIN ROUTES (WITH LAYOUT) ================= */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="foods" element={<AdminFoods />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="delivery" element={<AdminDelivery />} />
        <Route path="coupons" element={<AdminCoupons />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* ================= DELIVERY ROUTES ================= */}
      <Route path="/delivery" element={<ProtectedRoute allowedRoles={['delivery']}><DeliveryLayout /></ProtectedRoute>}>
        <Route index element={<DeliveryDashboard />} />
        <Route path="orders" element={<DeliveryOrders />} />
        <Route path="history" element={<DeliveryHistory />} />
        <Route path="earnings" element={<DeliveryEarnings />} />
        <Route path="profile" element={<DeliveryProfile />} />
        <Route path="support" element={<DeliverySupport />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

const NotFound = () => (
  <div style={{ textAlign: 'center', padding: '100px' }}>
    <h1>404 - Page Not Found</h1>
    <a href="/">Go Home</a>
  </div>
)

export default App