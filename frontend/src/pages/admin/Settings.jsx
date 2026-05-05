import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getSettings, updateSettings, toggleFeature, getSystemHealth } from '../../services/admin'
import toast from 'react-hot-toast'
import '../../styles/admin/common.css'      // ✅ ADD THIS
import '../../styles/admin/settings.css'

const Settings = () => {
  const { token } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({})
  const [systemHealth, setSystemHealth] = useState(null)
  const [features, setFeatures] = useState({
    delivery: true,
    pickup: true,
    cod: true,
    wallet: true,
    razorpay: true,
    reviews: true,
    offers: true
  })

  useEffect(() => {
    fetchSettings()
    fetchSystemHealth()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const response = await getSettings()
      setSettings(response.settings || {})
      
      // Set feature toggles from settings
      const featureToggles = {
        delivery: response.settings?.feature_delivery !== false,
        pickup: response.settings?.feature_pickup !== false,
        cod: response.settings?.feature_cod !== false,
        wallet: response.settings?.feature_wallet !== false,
        razorpay: response.settings?.feature_razorpay !== false,
        reviews: response.settings?.feature_reviews !== false,
        offers: response.settings?.feature_offers !== false
      }
      setFeatures(featureToggles)
    } catch (error) {
      console.error('Failed to fetch settings:', error)
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const fetchSystemHealth = async () => {
    try {
      const response = await getSystemHealth()
      setSystemHealth(response.health)
    } catch (error) {
      console.error('Failed to fetch system health:', error)
    }
  }

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleFeatureToggle = async (feature, currentState) => {
    try {
      const newState = !currentState
      await toggleFeature(feature, newState)
      setFeatures(prev => ({ ...prev, [feature]: newState }))
      toast.success(`${feature} ${newState ? 'enabled' : 'disabled'} successfully`)
    } catch (error) {
      toast.error('Failed to toggle feature')
    }
  }

  const handleSaveSettings = async () => {
    setSaving(true)
    try {
      await updateSettings(settings)
      toast.success('Settings saved successfully')
      fetchSettings()
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading settings...</div>
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>System Settings</h1>
        <p>Configure your application settings</p>
      </div>

      <div className="settings-grid">
        {/* General Settings */}
        <div className="settings-card">
          <h2>General Settings</h2>
          <div className="setting-item">
            <label>App Name</label>
            <input
              type="text"
              value={settings.app_name || 'Food Delivery'}
              onChange={(e) => handleSettingChange('app_name', e.target.value)}
            />
          </div>
          <div className="setting-item">
            <label>App Version</label>
            <input
              type="text"
              value={settings.app_version || '1.0.0'}
              onChange={(e) => handleSettingChange('app_version', e.target.value)}
            />
          </div>
          <div className="setting-item">
            <label>Contact Email</label>
            <input
              type="email"
              value={settings.contact_email || 'support@foodapp.com'}
              onChange={(e) => handleSettingChange('contact_email', e.target.value)}
            />
          </div>
          <div className="setting-item">
            <label>Contact Phone</label>
            <input
              type="text"
              value={settings.contact_phone || '+91 9876543210'}
              onChange={(e) => handleSettingChange('contact_phone', e.target.value)}
            />
          </div>
        </div>

        {/* Delivery Settings */}
        <div className="settings-card">
          <h2>Delivery Settings</h2>
          <div className="setting-item">
            <label>Delivery Charge (₹)</label>
            <input
              type="number"
              value={settings.delivery_charge || 40}
              onChange={(e) => handleSettingChange('delivery_charge', parseInt(e.target.value))}
            />
          </div>
          <div className="setting-item">
            <label>Minimum Order Amount for Free Delivery (₹)</label>
            <input
              type="number"
              value={settings.min_order_amount || 499}
              onChange={(e) => handleSettingChange('min_order_amount', parseInt(e.target.value))}
            />
          </div>
          <div className="setting-item">
            <label>Delivery Boy Commission (%)</label>
            <input
              type="number"
              value={settings.delivery_boy_commission || 10}
              onChange={(e) => handleSettingChange('delivery_boy_commission', parseInt(e.target.value))}
            />
          </div>
          <div className="setting-item">
            <label>Max Delivery Distance (km)</label>
            <input
              type="number"
              value={settings.max_distance_km || 10}
              onChange={(e) => handleSettingChange('max_distance_km', parseInt(e.target.value))}
            />
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="settings-card">
          <h2>Feature Toggles</h2>
          <div className="setting-item toggle">
            <label>Delivery Service</label>
            <button 
              className={`toggle-btn ${features.delivery ? 'on' : 'off'}`}
              onClick={() => handleFeatureToggle('delivery', features.delivery)}
            >
              {features.delivery ? 'ON' : 'OFF'}
            </button>
          </div>
          <div className="setting-item toggle">
            <label>Pickup Service</label>
            <button 
              className={`toggle-btn ${features.pickup ? 'on' : 'off'}`}
              onClick={() => handleFeatureToggle('pickup', features.pickup)}
            >
              {features.pickup ? 'ON' : 'OFF'}
            </button>
          </div>
          <div className="setting-item toggle">
            <label>Cash on Delivery</label>
            <button 
              className={`toggle-btn ${features.cod ? 'on' : 'off'}`}
              onClick={() => handleFeatureToggle('cod', features.cod)}
            >
              {features.cod ? 'ON' : 'OFF'}
            </button>
          </div>
          <div className="setting-item toggle">
            <label>Wallet Payment</label>
            <button 
              className={`toggle-btn ${features.wallet ? 'on' : 'off'}`}
              onClick={() => handleFeatureToggle('wallet', features.wallet)}
            >
              {features.wallet ? 'ON' : 'OFF'}
            </button>
          </div>
          <div className="setting-item toggle">
            <label>Razorpay Payment</label>
            <button 
              className={`toggle-btn ${features.razorpay ? 'on' : 'off'}`}
              onClick={() => handleFeatureToggle('razorpay', features.razorpay)}
            >
              {features.razorpay ? 'ON' : 'OFF'}
            </button>
          </div>
          <div className="setting-item toggle">
            <label>Reviews & Ratings</label>
            <button 
              className={`toggle-btn ${features.reviews ? 'on' : 'off'}`}
              onClick={() => handleFeatureToggle('reviews', features.reviews)}
            >
              {features.reviews ? 'ON' : 'OFF'}
            </button>
          </div>
          <div className="setting-item toggle">
            <label>Discounts & Offers</label>
            <button 
              className={`toggle-btn ${features.offers ? 'on' : 'off'}`}
              onClick={() => handleFeatureToggle('offers', features.offers)}
            >
              {features.offers ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        {/* System Health */}
        {systemHealth && (
          <div className="settings-card">
            <h2>System Health</h2>
            <div className="health-item">
              <span>Database Status:</span>
              <span className={`health-status ${systemHealth.database === 'connected' ? 'healthy' : 'unhealthy'}`}>
                {systemHealth.database || 'Connected'}
              </span>
            </div>
            <div className="health-item">
              <span>Server Uptime:</span>
              <span>{systemHealth.uptime || 'N/A'}</span>
            </div>
            <div className="health-item">
              <span>Memory Usage:</span>
              <span>{systemHealth.memory?.rss || 'N/A'}</span>
            </div>
            <div className="health-item">
              <span>Last Checked:</span>
              <span>{new Date().toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>

      <div className="settings-actions">
        <button 
          className="btn-primary" 
          onClick={handleSaveSettings}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>
    </div>
  )
}

export default Settings