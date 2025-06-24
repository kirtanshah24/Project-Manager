import React, { createContext, useContext, useState, useEffect } from 'react'
import { toast } from 'react-toastify'

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

  useEffect(() => {
    // Load data from localStorage
    const storedClients = localStorage.getItem('freelancer_clients')
    const storedInvoices = localStorage.getItem('freelancer_invoices')
    const storedExpenses = localStorage.getItem('freelancer_expenses')

    if (storedClients) setClients(JSON.parse(storedClients))
    if (storedInvoices) setInvoices(JSON.parse(storedInvoices))
    if (storedExpenses) setExpenses(JSON.parse(storedExpenses))
  }, [])

  useEffect(() => {
    localStorage.setItem('freelancer_clients', JSON.stringify(clients))
  }, [clients])

  useEffect(() => {
    localStorage.setItem('freelancer_invoices', JSON.stringify(invoices))
  }, [invoices])

  useEffect(() => {
    localStorage.setItem('freelancer_expenses', JSON.stringify(expenses))
  }, [expenses])

  // Client CRUD operations
  const addClient = (client) => {
    const newClient = {
      ...client,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: 'active'
    }
    setClients(prev => [...prev, newClient])
    toast.success('Client added successfully!')
  }

  const updateClient = (id, updates) => {
    setClients(prev => prev.map(client => 
      client.id === id ? { ...client, ...updates } : client
    ))
    toast.success('Client updated successfully!')
  }

  const deleteClient = (id) => {
    setClients(prev => prev.filter(client => client.id !== id))
    toast.success('Client deleted successfully!')
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
    addClient,
    updateClient,
    deleteClient,
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