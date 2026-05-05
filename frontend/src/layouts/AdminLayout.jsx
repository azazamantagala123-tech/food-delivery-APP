import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import AdminHeader from '../components/admin/AdminHeader'
import AdminSidebar from '../components/admin/AdminSidebar'
import '../styles/admin/admin.css'

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="admin-layout">
      <AdminHeader onMenuClick={toggleSidebar} />
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="admin-main-content">
        <Outlet />  {/* ✅ This renders the current page content */}
      </div>
    </div>
  )
}

export default AdminLayout