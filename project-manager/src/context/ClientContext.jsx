import React, { createContext, useContext, useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { clientAPI } from '../utils/api'

const ClientContext = createContext()

export const useClients = () => {
  const context = useContext(ClientContext)
  if (!context) {
    throw new Error('useClients must be used within a ClientProvider')
  }
  return context
}

export const ClientProvider = ({ children }) => {
  const [clients, setClients] = useState([])
  const [invoices, setInvoices] = useState([])
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(false)

  // Load clients from API on component mount
  useEffect(() => {
    loadClients()
  }, [])

  // Load clients from API
  const loadClients = async () => {
    try {
      setLoading(true)
      const response = await clientAPI.getClients()
      if (response.success) {
        setClients(response.data.docs || response.data)
      }
    } catch (error) {
      console.error('Error loading clients:', error)
      toast.error('Failed to load clients')
    } finally {
      setLoading(false)
    }
  }

  // Client CRUD operations
  const addClient = async (clientData) => {
    try {
      setLoading(true)
      const response = await clientAPI.addClient(clientData)
      if (response.success) {
        setClients(prev => [...prev, response.data.client])
        toast.success('Client added successfully!')
      }
    } catch (error) {
      console.error('Error adding client:', error)
      toast.error(error.message || 'Failed to add client')
    } finally {
      setLoading(false)
    }
  }

  const updateClient = async (id, updates) => {
    try {
      setLoading(true)
      const response = await clientAPI.updateClient(id, updates)
      if (response.success) {
        setClients(prev => prev.map(client => 
          client._id === id ? response.data.client : client
        ))
        toast.success('Client updated successfully!')
      }
    } catch (error) {
      console.error('Error updating client:', error)
      toast.error(error.message || 'Failed to update client')
    } finally {
      setLoading(false)
    }
  }

  const deleteClient = async (id) => {
    try {
      setLoading(true)
      const response = await clientAPI.deleteClient(id)
      if (response.success) {
        setClients(prev => prev.filter(client => client._id !== id))
        toast.success('Client deleted successfully!')
      }
    } catch (error) {
      console.error('Error deleting client:', error)
      toast.error(error.message || 'Failed to delete client')
    } finally {
      setLoading(false)
    }
  }

  // Invoice CRUD operations
  const addInvoice = (invoice) => {
    const newInvoice = {
      ...invoice,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: 'draft',
      invoiceNumber: generateInvoiceNumber()
    }
    setInvoices(prev => [...prev, newInvoice])
    toast.success('Invoice created successfully!')
  }

  const updateInvoice = (id, updates) => {
    setInvoices(prev => prev.map(invoice => 
      invoice.id === id ? { ...invoice, ...updates } : invoice
    ))
    toast.success('Invoice updated successfully!')
  }

  const updateInvoiceStatus = (id, status) => {
    setInvoices(prev => prev.map(invoice =>
      invoice.id === id ? { ...invoice, status } : invoice
    ));
    toast.info(`Invoice status updated to ${status}`);
  };

  const deleteInvoice = (id) => {
    setInvoices(prev => prev.filter(invoice => invoice.id !== id))
    toast.success('Invoice deleted successfully!')
  }

  // Expense CRUD operations
  const addExpense = (expense) => {
    const newExpense = {
      ...expense,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    }
    setExpenses(prev => [...prev, newExpense])
    toast.success('Expense added successfully!')
  }

  const updateExpense = (id, updates) => {
    setExpenses(prev => prev.map(expense => 
      expense.id === id ? { ...expense, ...updates } : expense
    ))
    toast.success('Expense updated successfully!')
  }

  const deleteExpense = (id) => {
    setExpenses(prev => prev.filter(expense => expense.id !== id))
    toast.success('Expense deleted successfully!')
  }

  // Helper functions
  const generateInvoiceNumber = () => {
    const year = new Date().getFullYear()
    const count = invoices.filter(inv => inv.createdAt.includes(year)).length + 1
    return `INV-${year}-${count.toString().padStart(3, '0')}`
  }

  const getClientInvoices = (clientId) => {
    return invoices.filter(invoice => invoice.clientId === clientId)
  }

  const getClientExpenses = (clientId) => {
    return expenses.filter(expense => expense.clientId === clientId)
  }

  const value = {
    clients,
    invoices,
    expenses,
    loading,
    addClient,
    updateClient,
    deleteClient,
    loadClients,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    updateInvoiceStatus,
    addExpense,
    updateExpense,
    deleteExpense,
    getClientInvoices,
    getClientExpenses
  }

  return (
    <ClientContext.Provider value={value}>
      {children}
    </ClientContext.Provider>
  )
} 