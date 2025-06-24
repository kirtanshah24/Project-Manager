import React from 'react'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const { user, logout } = useAuth()

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              Freelancer Project Manager
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                  <span className="text-sm text-gray-700">{user.name || 'User'}</span>
                </div>
                <button
                  onClick={logout}
                  className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md"
                >
                  Logout
                </button>
              </>
            ) : (
              <span className="text-sm text-gray-500">Not logged in</span>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar 