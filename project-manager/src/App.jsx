import React, { useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Context Providers
import { ProjectProvider } from './context/ProjectContext'
import { ClientProvider } from './context/ClientContext'
import { AuthProvider } from './context/AuthContext'
import { TaskProvider } from './context/TaskContext'

// Components
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'

// Pages
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import Clients from './pages/Clients'
import Tasks from './pages/Tasks'
import Invoices from './pages/Invoices'
import InvoiceDetail from './pages/InvoiceDetail'
import Expenses from './pages/Expenses'
import Calendar from './pages/Calendar'
import Analytics from './pages/Analytics'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import ProjectDetail from './pages/ProjectDetail'
import ChangePassword from './pages/ChangePassword'

const App = () => {
  const location = useLocation()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  
  // List of routes that should NOT show the main layout
  const authRoutes = ['/login', '/forgot-password', '/change-password']
  const isAuthRoute = authRoutes.includes(location.pathname)

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const closeSidebar = () => {
    setIsSidebarOpen(false)
  }

  return (
    <AuthProvider>
      <ProjectProvider>
        <ClientProvider>
          <TaskProvider>
            <div className="min-h-screen bg-gray-50">
            {!isAuthRoute && (
              <Navbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
            )}
            <div className="flex">
              {!isAuthRoute && (
                <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
              )}
              <main className="flex-1 p-4 lg:p-6">
                <Routes>
                  {/* Auth routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/change-password" element={<ChangePassword />} />

                  {/* Main app routes */}
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/clients" element={<Clients />} />
                  <Route path="/tasks" element={<Tasks />} />
                  <Route path="/invoices" element={<Invoices />} />
                  <Route path="/invoices/:id" element={<InvoiceDetail />} />
                  <Route path="/expenses" element={<Expenses />} />
                  <Route path="/calendar" element={<Calendar />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/projects/:id" element={<ProjectDetail />} />
                </Routes>
              </main>
            </div>
            <ToastContainer position="top-right" />
          </div>
        </TaskProvider>
        </ClientProvider>
      </ProjectProvider>
    </AuthProvider>
  )
}

export default App