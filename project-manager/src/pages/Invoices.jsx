import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useClients } from '../context/ClientContext';
import { useProjects } from '../context/ProjectContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { formatINR } from '../utils/api';

const statusOptions = [
  { value: 'draft', label: 'Draft', color: 'bg-gray-200 text-gray-700' },
  { value: 'sent', label: 'Sent', color: 'bg-blue-100 text-blue-700' },
  { value: 'paid', label: 'Paid', color: 'bg-green-100 text-green-700' },
  { value: 'overdue', label: 'Overdue', color: 'bg-red-100 text-red-700' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-gray-400 text-white' },
];

const defaultBankDetails = {
  bank: 'Really Great Bank',
  accountName: 'John Smith',
  bsb: '000-000',
  accountNumber: '0000 0000',
};

const defaultPayTo = 'Avery Davis\n123 Anywhere St., Any City\n123-456-7890';

const Invoices = () => {
  const { invoices, deleteInvoice, updateInvoiceStatus, clients } = useClients();
  const { projects } = useProjects();
  const [filterStatus, setFilterStatus] = useState('all');
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({
    file: null,
    projectId: '',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    notes: ''
  });
  const [createData, setCreateData] = useState({
    invoiceNumber: `#${Math.floor(1000 + Math.random() * 9000)}`,
    projectId: '',
    clientId: '',
    clientName: '',
    billedTo: '',
    payTo: defaultPayTo,
    bankDetails: { ...defaultBankDetails },
    date: new Date().toISOString().split('T')[0],
    items: [{ description: '', amount: 0 }],
    discount: 0,
    notes: 'Payment is required within 14 business days of invoice date.',
    status: 'draft',
  });
  const previewRef = useRef();

  const handleCreateInvoice = (e) => {
    e.preventDefault();
    navigate('/invoices/new', { state: { invoiceDraft: createData } });
    setShowCreateModal(false);
    setCreateData({
      invoiceNumber: `#${Math.floor(1000 + Math.random() * 9000)}`,
      projectId: '',
      clientId: '',
      clientName: '',
      billedTo: '',
      payTo: defaultPayTo,
      bankDetails: { ...defaultBankDetails },
      date: new Date().toISOString().split('T')[0],
      items: [{ description: '', amount: 0 }],
      discount: 0,
      notes: 'Payment is required within 14 business days of invoice date.',
      status: 'draft',
    });
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

  // Quick status update
  const handleStatusChange = (invoice, status) => {
    updateInvoiceStatus(invoice.id, { ...invoice, status });
  };

  // Upload invoice
  const handleUploadInvoice = (e) => {
    e.preventDefault();
    // TODO: Implement file upload API call
    addInvoice({
      ...uploadData,
      id: Date.now().toString(),
      status: 'paid', // or let user pick
      uploaded: true,
      fileUrl: uploadData.file ? URL.createObjectURL(uploadData.file) : '',
      amount: parseFloat(uploadData.amount),
      createdAt: uploadData.date
    });
    setShowUploadModal(false);
    setUploadData({ file: null, projectId: '', date: new Date().toISOString().split('T')[0], amount: '', notes: '' });
  };

  // Live preview calculations
  const subTotal = createData.items.reduce((acc, item) => acc + (parseFloat(item.amount) || 0), 0);
  const discountAmount = (subTotal * (parseFloat(createData.discount) || 0)) / 100;
  const total = subTotal - discountAmount;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-600">Manage and track your invoices. Create or upload invoices and quickly update their status.</p>
        </div>
        <div className="flex space-x-2">
          <button onClick={() => setShowCreateModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Create Invoice</button>
          <button onClick={() => setShowUploadModal(true)} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">Upload Invoice</button>
        </div>
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
                <div><span className="font-medium">Amount:</span> {formatINR(invoice.amount)}</div>
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredInvoices.map(invoice => {
              const client = clients.find(c => c.id === invoice.clientId);
              const project = projects.find(p => p._id === invoice.projectId);
              return (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-blue-600 hover:underline">
                    <Link to={`/invoices/${invoice.id}`}>{invoice.invoiceNumber || invoice.id}</Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{project?.name || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(invoice.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{formatINR(invoice.amount || 0)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-1">
                      {statusOptions.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => handleStatusChange(invoice, opt.value)}
                          className={`px-2 py-1 rounded text-xs font-semibold border transition-colors ${invoice.status === opt.value ? opt.color : 'bg-gray-100 text-gray-400 border-gray-200 hover:bg-gray-200'}`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link to={`/invoices/${invoice.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">View</Link>
                    <button onClick={() => deleteInvoice(invoice.id)} className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {invoice.uploaded && invoice.fileUrl ? (
                      <a href={invoice.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">View</a>
                    ) : (
                      <span className="text-gray-400 text-xs">-</span>
                    )}
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

      {/* Create Invoice Modal (no preview) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto flex flex-col p-0 relative">
            {/* Sticky Modal Header */}
            <div className="absolute top-0 right-0 z-10">
              <button onClick={() => setShowCreateModal(false)} className="m-4 text-gray-400 hover:text-red-600 text-2xl font-bold">×</button>
            </div>
            {/* Form only, no preview */}
            <form onSubmit={handleCreateInvoice} className="flex-1 space-y-4 min-w-[300px] p-6 md:p-8">
              <h2 className="text-xl font-semibold mb-4">Create Invoice</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                <select
                  required
                  value={createData.clientId}
                  onChange={e => {
                    const clientId = e.target.value;
                    const clientName = clients.find(client => client.id === clientId)?.name || '';
                    setCreateData(prev => ({
                      ...prev,
                      clientId,
                      clientName,
                      projectId: '', // Reset projectId when client changes
                      billedTo: (!prev.billedTo || prev.billedTo === prev.clientName) ? clientName : prev.billedTo
                    }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Client</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                <select
                  required
                  value={createData.projectId}
                  onChange={e => {
                    const projectId = e.target.value;
                    setCreateData(prev => ({
                      ...prev,
                      projectId,
                      clientId: projects.find(p => p._id === projectId)?.clientId || '',
                    }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  disabled={!createData.clientId}
                >
                  <option value="">Select Project</option>
                  {projects.filter(project => String(project.clientId) === String(createData.clientId)).length === 0 && createData.clientId && (
                    <option disabled>No projects for this client</option>
                  )}
                  {projects
                    .filter(project => String(project.clientId) === String(createData.clientId))
                    .map(project => (
                      <option key={project._id} value={project._id}>{project.name}</option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Name (Billed To)</label>
                <input
                  type="text"
                  required
                  value={createData.billedTo}
                  onChange={e => setCreateData(prev => ({ ...prev, billedTo: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Client Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={createData.date}
                  onChange={e => setCreateData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
                <input
                  type="text"
                  required
                  value={createData.invoiceNumber}
                  onChange={e => setCreateData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Items</label>
                {createData.items.map((item, idx) => (
                  <div key={idx} className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      placeholder="Description"
                      value={item.description}
                      onChange={e => {
                        const items = [...createData.items];
                        items[idx].description = e.target.value;
                        setCreateData(prev => ({ ...prev, items }));
                      }}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded"
                    />
                    <input
                      type="number"
                      placeholder="Amount"
                      value={item.amount}
                      onChange={e => {
                        const items = [...createData.items];
                        items[idx].amount = e.target.value;
                        setCreateData(prev => ({ ...prev, items }));
                      }}
                      className="w-24 px-2 py-1 border border-gray-300 rounded"
                    />
                    <button type="button" onClick={() => {
                      setCreateData(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));
                    }} className="text-red-500">×</button>
                  </div>
                ))}
                <button type="button" onClick={() => setCreateData(prev => ({ ...prev, items: [...prev.items, { description: '', amount: 0 }] }))} className="text-blue-600 text-xs">+ Add Item</button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
                <input
                  type="number"
                  value={createData.discount}
                  onChange={e => setCreateData(prev => ({ ...prev, discount: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={createData.notes}
                  onChange={e => setCreateData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={() => setShowCreateModal(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300">Cancel</button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Next</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Invoice Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Upload Invoice</h2>
            <form onSubmit={handleUploadInvoice} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                <select
                  required
                  value={uploadData.projectId}
                  onChange={e => setUploadData({ ...uploadData, projectId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Project</option>
                  {projects.map(project => (
                    <option key={project._id} value={project._id}>{project.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={uploadData.date}
                  onChange={e => setUploadData({ ...uploadData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Price</label>
                <input
                  type="number"
                  required
                  placeholder="0.00"
                  value={uploadData.amount}
                  onChange={e => setUploadData({ ...uploadData, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invoice File (PDF/Image)</label>
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={e => setUploadData({ ...uploadData, file: e.target.files[0] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={uploadData.notes}
                  onChange={e => setUploadData({ ...uploadData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={() => setShowUploadModal(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300">Cancel</button>
                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">Upload</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices; 