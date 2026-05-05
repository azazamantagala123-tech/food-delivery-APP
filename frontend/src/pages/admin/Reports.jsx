import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getReports, getAnalytics, getRevenue } from '../../services/admin'
import toast from 'react-hot-toast'
import '../../styles/admin/common.css'      // ✅ ADD THIS
import '../../styles/admin/orders.css'      

const Reports = () => {
  const { token } = useAuth()
  const [loading, setLoading] = useState(false)
  const [reportData, setReportData] = useState(null)
  const [formData, setFormData] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    metrics: ['orders', 'users', 'foods']
  })

  const metricsOptions = [
    { value: 'orders', label: 'Orders Report' },
    { value: 'users', label: 'Users Report' },
    { value: 'foods', label: 'Foods Report' },
    { value: 'all', label: 'All Reports' }
  ]

  const handleGenerateReport = async () => {
    if (!formData.startDate || !formData.endDate) {
      toast.error('Please select start and end dates')
      return
    }

    setLoading(true)
    try {
      const response = await getReports({
        startDate: formData.startDate,
        endDate: formData.endDate,
        metrics: formData.metrics.includes('all') ? ['all'] : formData.metrics
      })
      setReportData(response.report)
      toast.success('Report generated successfully')
    } catch (error) {
      console.error('Failed to generate report:', error)
      toast.error('Failed to generate report')
    } finally {
      setLoading(false)
    }
  }

  const handleMetricChange = (metric) => {
    if (metric === 'all') {
      setFormData({ ...formData, metrics: ['all'] })
    } else {
      let newMetrics = [...formData.metrics]
      if (newMetrics.includes('all')) {
        newMetrics = [metric]
      } else if (newMetrics.includes(metric)) {
        newMetrics = newMetrics.filter(m => m !== metric)
      } else {
        newMetrics.push(metric)
      }
      setFormData({ ...formData, metrics: newMetrics })
    }
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Reports & Analytics</h1>
        <p>Generate and download business reports</p>
      </div>

      <div className="reports-filters">
        <div className="filter-group">
          <label>Start Date</label>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          />
        </div>
        <div className="filter-group">
          <label>End Date</label>
          <input
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
          />
        </div>
        <div className="filter-group">
          <label>Report Type</label>
          <div className="checkbox-group">
            {metricsOptions.map(option => (
              <label key={option.value}>
                <input
                  type="checkbox"
                  checked={formData.metrics.includes(option.value)}
                  onChange={() => handleMetricChange(option.value)}
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>
        <button 
          className="btn-primary" 
          onClick={handleGenerateReport}
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Generate Report'}
        </button>
      </div>

      {reportData && (
        <div className="report-results">
          {/* Orders Section */}
          {(formData.metrics.includes('orders') || formData.metrics.includes('all')) && reportData.orders !== undefined && (
            <div className="report-section">
              <h2>Orders Summary</h2>
              <div className="stats-cards">
                <div className="stat-card-small">
                  <h3>Total Orders</h3>
                  <p>{reportData.orders || 0}</p>
                </div>
                <div className="stat-card-small">
                  <h3>Total Revenue</h3>
                  <p>₹{reportData.orderValue?.[0]?.total?.toLocaleString() || 0}</p>
                </div>
                <div className="stat-card-small">
                  <h3>Average Order Value</h3>
                  <p>₹{Math.round(reportData.orderValue?.[0]?.avg || 0)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Users Section */}
          {(formData.metrics.includes('users') || formData.metrics.includes('all')) && (
            <div className="report-section">
              <h2>Users Summary</h2>
              <div className="stats-cards">
                <div className="stat-card-small">
                  <h3>New Users</h3>
                  <p>{reportData.newUsers || 0}</p>
                </div>
                <div className="stat-card-small">
                  <h3>Total Users</h3>
                  <p>{reportData.totalUsers || 0}</p>
                </div>
              </div>
            </div>
          )}

          {/* Foods Section */}
          {(formData.metrics.includes('foods') || formData.metrics.includes('all')) && reportData.topFoods && (
            <div className="report-section">
              <h2>Top Selling Foods</h2>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Food Name</th>
                    <th>Total Sold</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.topFoods?.map((food, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{food.food?.[0]?.name || food._id}</td>
                      <td>{food.totalSold || 0}</td>
                    </tr>
                  ))}
                  {(!reportData.topFoods || reportData.topFoods.length === 0) && (
                    <tr>
                      <td colSpan="3" className="no-data">No data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {!reportData && !loading && (
        <div className="no-data-message">
          <p>Select date range and metrics to generate report</p>
        </div>
      )}
    </div>
  )
}

export default Reports