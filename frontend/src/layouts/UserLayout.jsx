import React from 'react'
import { Outlet } from 'react-router-dom'
import UserNavbar from '../components/user/Navbar'

const UserLayout = () => {
  return (
    <>
      <UserNavbar />
      <div style={{ 
        paddingTop: '76px',
        minHeight: '100vh',
        background: '#0d0d12'
      }}>
        <Outlet />
      </div>
    </>
  )
}

export default UserLayout