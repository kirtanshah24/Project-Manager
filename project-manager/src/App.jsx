import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Context Providers
import { ProjectProvider } from './context/ProjectContext'
import { ClientProvider } from './context/ClientContext'
import { AuthProvider } from './context/AuthContext'

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
import ProjectDetail from './pages/ProjectDetail'

const App = () => {
  return (
    <AuthProvider>
      <ProjectProvider>
        <ClientProvider>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="flex">
              <Sidebar />
              <main className="flex-1 p-6">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/clients" element={<Clients />} />
                  <Route path="/tasks" element={<Tasks />} />
                  <Route path="/invoices" element={<Invoices />} />
                  <Route path="/invoices/:id" element={<InvoiceDetail />} />
                  <Route path="/expenses" element={<Expenses />} />
                  <Route path="/calendar" element={<Calendar />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/projects/:id" element={<ProjectDetail />} />
                </Routes>
              </main>
            </div>
            <ToastContainer position="top-right" />
          </div>
        </ClientProvider>
      </ProjectProvider>
    </AuthProvider>
  )
}

export default App