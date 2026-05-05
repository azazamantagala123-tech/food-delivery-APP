import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getAdminUsers, blockUser, getUserDetails } from '../../services/admin'
import toast from 'react-hot-toast'
import '../../styles/admin/common.css'      // ✅ ADD THIS
import '../../styles/admin/users.css'       

const Users = () => {
  const { token } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [blockReason, setBlockReason] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [searchTerm, roleFilter, statusFilter])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = {}
      if (searchTerm) params.search = searchTerm
      if (roleFilter) params.role = roleFilter
      if (statusFilter) params.status = statusFilter
      
      const response = await getAdminUsers(params)
      setUsers(response.users || [])
    } catch (error) {
      console.error('Failed to fetch users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleBlockUser = async () => {
    if (!selectedUser) return
    
    try {
      await blockUser(selectedUser._id, blockReason)
      toast.success(`${selectedUser.name} has been ${selectedUser.isBlocked ? 'unblocked' : 'blocked'}`)
      setShowBlockModal(false)
      setSelectedUser(null)
      setBlockReason('')
      fetchUsers()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed')
    }
  }

  const handleViewDetails = async (user) => {
    try {
      const response = await getUserDetails(user._id)
      setSelectedUser(response.user)
      setShowBlockModal(true)
    } catch (error) {
      toast.error('Failed to fetch user details')
    }
  }

  const getRoleBadge = (role) => {
    const roleColors = {
      user: '#28a745',
      admin: '#dc3545',
      delivery: '#ffc107'
    }
    return {
      backgroundColor: roleColors[role] || '#6c757d',
      color: 'white',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      textTransform: 'capitalize'
    }
  }

  const getStatusBadge = (isBlocked) => {
    return {
      backgroundColor: isBlocked ? '#dc3545' : '#28a745',
      color: 'white',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px'
    }
  }

  if (loading) {
    return <div className="loading">Loading users...</div>
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>User Management</h1>
        <p>Manage all users, view details, and block/unblock accounts</p>
      </div>

      <div className="filters-bar">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-group">
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="delivery">Delivery</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="filter-group">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
        <button className="btn-primary" onClick={fetchUsers}>Apply Filters</button>
      </div>

      <div className="users-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="8" className="no-data">No users found</td>
              </tr>
            ) : (
              users.map((user, index) => (
                <tr key={user._id}>
                  <td>{index + 1}</td>
                  <td><strong>{user.name}</strong></td>
                  <td>{user.email}</td>
                  <td>{user.phone || '-'}</td>
                  <td>
                    <span style={getRoleBadge(user.role)}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span style={getStatusBadge(user.isBlocked)}>
                      {user.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button 
                      className="view-btn" 
                      onClick={() => handleViewDetails(user)}
                    >
                      View
                    </button>
                    <button 
                      className={user.isBlocked ? 'unblock-btn' : 'block-btn'} 
                      onClick={() => {
                        setSelectedUser(user)
                        setShowBlockModal(true)
                      }}
                    >
                      {user.isBlocked ? 'Unblock' : 'Block'}
                    </button>
                  </td>
                 </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* User Details Modal */}
      {showBlockModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowBlockModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <h2>User Details</h2>
            
            <div className="user-details">
              <div className="detail-row">
                <span className="detail-label">Name:</span>
                <span className="detail-value">{selectedUser.name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{selectedUser.email}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Phone:</span>
                <span className="detail-value">{selectedUser.phone || 'Not provided'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Role:</span>
                <span className="detail-value">{selectedUser.role}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status:</span>
                <span className={`status-value ${selectedUser.isBlocked ? 'blocked' : 'active'}`}>
                  {selectedUser.isBlocked ? 'Blocked' : 'Active'}
                </span>
              </div>
              {selectedUser.isBlocked && selectedUser.blockReason && (
                <div className="detail-row">
                  <span className="detail-label">Block Reason:</span>
                  <span className="detail-value">{selectedUser.blockReason}</span>
                </div>
              )}
              <div className="detail-row">
                <span className="detail-label">Joined:</span>
                <span className="detail-value">{new Date(selectedUser.createdAt).toLocaleString()}</span>
              </div>
              {selectedUser.stats && (
                <>
                  <div className="detail-row">
                    <span className="detail-label">Total Orders:</span>
                    <span className="detail-value">{selectedUser.stats.totalOrders || 0}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Total Spent:</span>
                    <span className="detail-value">₹{selectedUser.stats.totalSpent?.toLocaleString() || 0}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Average Order Value:</span>
                    <span className="detail-value">₹{selectedUser.stats.averageOrderValue?.toLocaleString() || 0}</span>
                  </div>
                </>
              )}
            </div>

            {!selectedUser.isBlocked ? (
              <div className="block-section">
                <h3>Block User</h3>
                <div className="form-group">
                  <label>Reason for blocking (optional)</label>
                  <textarea
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    rows="3"
                    placeholder="Enter reason for blocking this user..."
                  />
                </div>
              </div>
            ) : (
              <div className="block-section">
                <h3>Unblock User</h3>
                <p>Are you sure you want to unblock this user?</p>
              </div>
            )}

            <div className="modal-buttons">
              <button className="btn-secondary" onClick={() => setShowBlockModal(false)}>Cancel</button>
              <button 
                className={selectedUser.isBlocked ? 'btn-success' : 'btn-danger'} 
                onClick={handleBlockUser}
              >
                {selectedUser.isBlocked ? 'Unblock User' : 'Block User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Users