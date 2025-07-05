import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: '🏠' },
    { name: 'Projects', href: '/projects', icon: '📁' },
    { name: 'Clients', href: '/clients', icon: '👥' },
    { name: 'Tasks', href: '/tasks', icon: '✅' },
    { name: 'Invoices', href: '/invoices', icon: '🧾' },
    { name: 'Expenses', href: '/expenses', icon: '💳' },
    { name: 'Calendar', href: '/calendar', icon: '📅' },
    { name: 'Analytics', href: '/analytics', icon: '📊' },
  ];

  const NavItem = ({ to, icon, children }) => {
    const isActive = location.pathname === to;
    return (
      <NavLink
        to={to}
        onClick={onClose}
        className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
          isActive
            ? 'bg-blue-100 text-blue-700'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`}
      >
        <span className="mr-3 text-lg">{icon}</span>
        {children}
      </NavLink>
    );
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          <div className="text-xl font-bold text-gray-800">
            <span className="hidden sm:inline">Freelancer</span>
            <span className="sm:hidden">FPM</span>
          </div>
          
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <span className="sr-only">Close sidebar</span>
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        
        <div className="p-4">
          <nav className="space-y-1">
            {navigation.map((item) => (
              <NavItem key={item.name} to={item.href} icon={item.icon}>
                {item.name}
              </NavItem>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;