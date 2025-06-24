import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const Sidebar = () => {
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
        className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
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
    <div className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
      <div className="h-16 flex items-center justify-center text-2xl font-bold border-b border-gray-200 text-gray-800">
        Freelancer
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
  );
};

export default Sidebar;