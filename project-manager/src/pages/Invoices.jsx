import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useClients } from '../context/ClientContext';

const Invoices = () => {
  const { invoices, deleteInvoice, updateInvoiceStatus, clients } = useClients();
  const [filterStatus, setFilterStatus] = useState('all');
  const navigate = useNavigate();

  const handleCreateInvoice = () => {
    // Navigate to the detail page with a 'new' identifier
    // The detail page will handle the creation form
    navigate('/invoices/new');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const filteredInvoices = invoices.filter(invoice => 
    filterStatus === 'all' || invoice.status === filterStatus
  ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 px-2 lg:px-0">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-sm lg:text-base text-gray-600">Manage all your invoices.</p>
        </div>
        <Link 
          to="/invoices/new" 
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 w-full sm:w-auto text-center"
        >
          Create New Invoice
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 px-2 lg:px-0">
        <button onClick={() => setFilterStatus('all')} className={`px-3 py-1 rounded-md text-sm ${filterStatus === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>All</button>
        <button onClick={() => setFilterStatus('draft')} className={`px-3 py-1 rounded-md text-sm ${filterStatus === 'draft' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Draft</button>
        <button onClick={() => setFilterStatus('sent')} className={`px-3 py-1 rounded-md text-sm ${filterStatus === 'sent' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Sent</button>
        <button onClick={() => setFilterStatus('paid')} className={`px-3 py-1 rounded-md text-sm ${filterStatus === 'paid' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Paid</button>
        <button onClick={() => setFilterStatus('overdue')} className={`px-3 py-1 rounded-md text-sm ${filterStatus === 'overdue' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Overdue</button>
      </div>

      {/* Invoice List - Cards for mobile, table for desktop */}
      <div className="block lg:hidden space-y-3 px-2 lg:px-0">
        {filteredInvoices.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No invoices match the current filter.</p>
          </div>
        )}
        {filteredInvoices.map(invoice => {
          const client = clients.find(c => c.id === invoice.clientId);
          return (
            <div key={invoice.id} className="bg-white rounded-lg shadow p-4 flex flex-col gap-2 border border-gray-100">
              <div className="flex justify-between items-center">
                <div className="font-semibold text-blue-600 text-base">
                  <Link to={`/invoices/${invoice.id}`}>{invoice.invoiceNumber}</Link>
                </div>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                  {invoice.status}
                </span>
              </div>
              <div className="flex flex-col gap-1 text-sm text-gray-700">
                <div><span className="font-medium">Client:</span> {client?.name || 'N/A'}</div>
                <div><span className="font-medium">Date:</span> {new Date(invoice.createdAt).toLocaleDateString()}</div>
                <div><span className="font-medium">Amount:</span> ${invoice.amount.toFixed(2)}</div>
              </div>
              <div className="flex gap-2 mt-2">
                <Link to={`/invoices/${invoice.id}`} className="flex-1 text-center text-indigo-600 hover:text-indigo-900 text-sm py-1 rounded bg-indigo-50">View</Link>
                <button onClick={() => deleteInvoice(invoice.id)} className="flex-1 text-center text-red-600 hover:text-red-900 text-sm py-1 rounded bg-red-50">Delete</button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Table for desktop */}
      <div className="hidden lg:block bg-white rounded-lg shadow overflow-x-auto border border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredInvoices.map(invoice => {
              const client = clients.find(c => c.id === invoice.clientId);
              return (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-blue-600 hover:underline">
                    <Link to={`/invoices/${invoice.id}`}>{invoice.invoiceNumber}</Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{client?.name || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(invoice.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">${invoice.amount.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link to={`/invoices/${invoice.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">View</Link>
                    <button onClick={() => deleteInvoice(invoice.id)} className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filteredInvoices.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No invoices match the current filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Invoices; 