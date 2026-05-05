import React from 'react'
import AdminSidebar from '../components/admin/AdminSidebar'
import AdminHeader from '../components/admin/AdminHeader'

const AdminLayout = ({ children }) => {
  return (
    <div className="admin-layout">
      <AdminSidebar />

      <div className="main-area">
        <AdminHeader />
        <div className="admin-main-content">
          {children}
        </div>
      </div>
    </div>
  )
}

export default AdminLayout