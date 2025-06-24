import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useClients } from '../context/ClientContext';
import { useProjects } from '../context/ProjectContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { invoices, clients, addInvoice, updateInvoiceStatus } = useClients();
  const { projects } = useProjects();
  const invoiceRef = React.useRef();

  const isNew = id === 'new';

  const initialInvoiceState = {
    invoiceNumber: `#${Math.floor(1000 + Math.random() * 9000)}`,
    billedTo: '',
    payTo: 'Avery Davis\n123 Anywhere St., Any City\n123-456-7890',
    bankDetails: { bank: 'Really Great Bank', accountName: 'John Smith', bsb: '000-000', accountNumber: '0000 0000' },
    items: [],
    discount: 0,
    notes: 'Payment is required within 14 business days of invoice date.',
    status: 'draft',
  };

  const [invoiceData, setInvoiceData] = useState(initialInvoiceState);
  const [selectedProject, setSelectedProject] = useState('');

  useEffect(() => {
    if (!isNew) {
      const foundInvoice = invoices.find((inv) => inv.id === id);
      if (foundInvoice) {
        setInvoiceData(foundInvoice);
      }
    }
  }, [id, invoices, isNew]);

  useEffect(() => {
    if (isNew && selectedProject) {
      const project = projects.find(p => p.id === selectedProject);
      if (project) {
        const client = clients.find(c => c.id === project.clientId);
        const projectTasks = project.tasks || [];

        setInvoiceData(prev => ({
          ...prev,
          billedTo: client?.name || '',
          items: projectTasks.map(task => ({
            description: task.title,
            rate: 50, // Default to 50, user can edit
            hours: 1, // Default to 1 hour, user can edit
          })),
        }));
      }
    }
  }, [selectedProject, projects, clients, isNew]);

  if (!isNew && !invoices.find((inv) => inv.id === id)) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold">Invoice not found</h1>
        <Link to="/invoices" className="text-blue-600 hover:underline">
          Back to All Invoices
        </Link>
      </div>
    );
  }

  const invoice = isNew ? invoiceData : invoices.find((inv) => inv.id === id);

  const subTotal = invoice.items.reduce((acc, item) => acc + (parseFloat(item.rate) || 0) * (parseFloat(item.hours) || 0), 0);
  const discountAmount = (subTotal * (parseFloat(invoice.discount) || 0)) / 100;
  const total = subTotal - discountAmount;

  const downloadPDF = () => {
    const input = invoiceRef.current;
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`invoice-${invoice.invoiceNumber}.pdf`);
    });
  };

  const handleSave = () => {
    const client = clients.find(c => c.name === invoiceData.billedTo);
    addInvoice({
      ...invoiceData,
      amount: total,
      clientId: client?.id,
      dueDate: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString(),
    });
    navigate('/invoices');
  };

  const handleInputChange = (e) => setInvoiceData(prev => ({ ...prev, [name]: value }));
  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const items = [...invoiceData.items];
    items[index][name] = value;
    setInvoiceData(prev => ({ ...prev, items }));
  };
  const handleAddItem = () => setInvoiceData(prev => ({ ...prev, items: [...prev.items, { description: '', rate: 0, hours: 0 }] }));
  const handleRemoveItem = (index) => {
    const items = [...invoiceData.items];
    items.splice(index, 1);
    setInvoiceData(prev => ({ ...prev, items }));
  };

  // Reusable EditableField component for the form
  const EditableField = ({ value, name, onChange, placeholder, className, isTextarea = false }) => {
    const Component = isTextarea ? 'textarea' : 'input';
    return <Component type="text" name={name} value={value} onChange={onChange} placeholder={placeholder} className={`bg-transparent p-1 -m-1 focus:bg-gray-100 focus:outline-blue-200 rounded-sm w-full ${className}`} />;
  };

  const renderEditableForm = () => (
    <>
        <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Invoice</h1>
              <select onChange={(e) => setSelectedProject(e.target.value)} value={selectedProject} className="p-2 border border-gray-300 rounded-md">
                <option value="">Create from scratch...</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="flex space-x-2">
              <button onClick={downloadPDF} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">Download PDF</button>
              <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Save Invoice</button>
            </div>
        </div>
        <div ref={invoiceRef} className="w-[210mm] min-h-[297mm] bg-white shadow-2xl p-16 text-gray-800 flex flex-col">
            <div className="flex justify-between items-start mb-16">
              <h1 className="text-5xl font-light tracking-widest">INVOICE</h1>
              <EditableField value={invoiceData.invoiceNumber} name="invoiceNumber" onChange={handleInputChange} className="text-xl text-right font-semibold" />
            </div>
            
            <div className="flex mb-16">
              <div className="w-1/2 pr-8">
                <h2 className="text-sm font-bold tracking-wider mb-2">BILLED TO:</h2>
                <select name="billedTo" value={invoiceData.billedTo} onChange={handleInputChange} className="text-lg bg-transparent p-1 -m-1 focus:bg-gray-100 focus:outline-blue-200 rounded-sm w-full">
                    <option value="">Select a Client</option>
                    {clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div className="w-1/2">
                <h2 className="text-sm font-bold tracking-wider mb-2">PAY TO:</h2>
                <EditableField name="payTo" value={invoiceData.payTo} onChange={handleInputChange} isTextarea className="text-lg whitespace-pre-line" />
              </div>
            </div>
            
            <div className="grid grid-cols-[max-content_1fr] gap-x-8 gap-y-2 mb-16 text-lg">
                <span className="text-sm font-bold tracking-wider">Bank</span>
                <EditableField value={invoiceData.bankDetails.bank} name="bank" onChange={(e) => setInvoiceData(p => ({...p, bankDetails: {...p.bankDetails, bank: e.target.value}}))} />
                <span className="text-sm font-bold tracking-wider">Account Name</span>
                <EditableField value={invoiceData.bankDetails.accountName} name="accountName" onChange={(e) => setInvoiceData(p => ({...p, bankDetails: {...p.bankDetails, accountName: e.target.value}}))} />
                <span className="text-sm font-bold tracking-wider">BSB</span>
                <EditableField value={invoiceData.bankDetails.bsb} name="bsb" onChange={(e) => setInvoiceData(p => ({...p, bankDetails: {...p.bankDetails, bsb: e.target.value}}))} />
                <span className="text-sm font-bold tracking-wider">Account Number</span>
                <EditableField value={invoiceData.bankDetails.accountNumber} name="accountNumber" onChange={(e) => setInvoiceData(p => ({...p, bankDetails: {...p.bankDetails, accountNumber: e.target.value}}))} />
            </div>

            <table className="w-full mb-4">
              <thead>
                <tr className="border-b-2 border-gray-500 text-left">
                  <th className="py-2 text-sm font-bold tracking-wider w-full">DESCRIPTION</th>
                  <th className="py-2 text-sm font-bold tracking-wider text-right px-4">RATE</th>
                  <th className="py-2 text-sm font-bold tracking-wider text-right px-4">HOURS</th>
                  <th className="py-2 text-sm font-bold tracking-wider text-right">AMOUNT</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.items.map((item, index) => (
                  <tr key={index}>
                    <td className="py-1 pr-2 border-b border-gray-300">
                      <EditableField name="description" value={item.description} onChange={(e) => handleItemChange(index, e)} className="text-lg" />
                    </td>
                    <td className="py-1 px-4 border-b border-gray-300 text-right w-24">
                      <EditableField name="rate" value={item.rate} onChange={(e) => handleItemChange(index, e)} className="text-lg text-right" />
                    </td>
                    <td className="py-1 px-4 border-b border-gray-300 text-right w-24">
                      <EditableField name="hours" value={item.hours} onChange={(e) => handleItemChange(index, e)} className="text-lg text-right" />
                    </td>
                    <td className="py-1 pl-2 text-right text-lg border-b border-gray-300 w-32">${((item.rate || 0) * (item.hours || 0)).toFixed(2)}</td>
                    <td className="py-1 pl-2 border-b border-gray-300 text-center"><button onClick={() => handleRemoveItem(index)} className="text-red-500 hover:text-red-700 font-bold">✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={handleAddItem} className="bg-blue-100 text-blue-700 px-4 py-2 rounded-md hover:bg-blue-200 text-left self-start">Add Item</button>

             <div className="flex justify-end mb-16 mt-8">
              <div className="w-1/2">
                <div className="flex justify-between py-2">
                  <span className="text-lg">Sub Total</span>
                  <span className="text-lg">${subTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b-2 border-gray-300">
                  <span className="text-lg">Discount (%)</span>
                  <EditableField name="discount" value={invoiceData.discount} onChange={handleInputChange} className="text-lg text-right w-20" />
                </div>
                <div className="flex justify-between py-4">
                  <span className="text-xl font-bold">TOTAL</span>
                  <span className="text-xl font-bold">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-auto">
              <h2 className="text-sm font-bold tracking-wider mb-2">NOTES:</h2>
              <EditableField name="notes" value={invoiceData.notes} onChange={handleInputChange} isTextarea className="text-gray-500 text-sm" />
              <p className="mt-4 text-gray-500 text-sm">Thank you for your business.</p>
            </div>
        </div>
    </>
  );

  const renderStaticView = () => (
    <>
      <div className="flex justify-between items-center mb-8">
          <div>
            <Link to="/invoices" className="text-blue-600 hover:underline mb-4 block">&larr; Back to All Invoices</Link>
            <h1 className="text-2xl font-bold text-gray-900">Invoice {invoice.invoiceNumber}</h1>
            <span className={`px-3 py-1 text-sm font-semibold rounded-full`}>{invoice.status}</span>
          </div>
          <div className="flex items-center space-x-2">
            <select value={invoice.status} onChange={(e) => updateInvoiceStatus(invoice.id, e.target.value)} className="p-2 border border-gray-300 rounded-md">
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
            </select>
            <button onClick={downloadPDF} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">Download PDF</button>
          </div>
      </div>
      <div ref={invoiceRef} className="w-[210mm] min-h-[297mm] bg-white shadow-2xl p-16 text-gray-800">
          <div className="flex justify-between items-start mb-16">
             <h1 className="text-5xl font-light tracking-widest">INVOICE</h1>
             <div className="text-xl text-right font-semibold">{invoice.invoiceNumber}</div>
           </div>
           
           <div className="flex mb-16">
               <div className="w-1/2 pr-8">
                 <h2 className="text-sm font-bold tracking-wider mb-2">BILLED TO:</h2>
                 <div className="text-lg">{invoice.billedTo}</div>
               </div>
               <div className="w-1/2">
                 <h2 className="text-sm font-bold tracking-wider mb-2">PAY TO:</h2>
                 <div className="text-lg whitespace-pre-line">{invoice.payTo}</div>
               </div>
             </div>
             
             <div className="grid grid-cols-[max-content_1fr] gap-x-8 gap-y-2 mb-16 text-lg">
               <span className="text-sm font-bold tracking-wider">Bank</span>
               <span>{invoice.bankDetails.bank}</span>
               <span className="text-sm font-bold tracking-wider">Account Name</span>
               <span>{invoice.bankDetails.accountName}</span>
               <span className="text-sm font-bold tracking-wider">BSB</span>
               <span>{invoice.bankDetails.bsb}</span>
               <span className="text-sm font-bold tracking-wider">Account Number</span>
               <span>{invoice.bankDetails.accountNumber}</span>
             </div>
             
             <table className="w-full mb-4">
               <thead>
                 <tr className="border-b-2 border-gray-500 text-left">
                   <th className="py-2 text-sm font-bold tracking-wider w-full">DESCRIPTION</th>
                   <th className="py-2 text-sm font-bold tracking-wider text-right px-4">RATE</th>
                   <th className="py-2 text-sm font-bold tracking-wider text-right px-4">HOURS</th>
                   <th className="py-2 text-sm font-bold tracking-wider text-right">AMOUNT</th>
                 </tr>
               </thead>
               <tbody>
                 {invoice.items.map((item, index) => (
                   <tr key={index}>
                     <td className="py-1 pr-2 border-b border-gray-300 text-lg">{item.description}</td>
                     <td className="py-1 px-4 border-b border-gray-300 text-lg text-right w-24">${(parseFloat(item.rate) || 0).toFixed(2)}</td>
                     <td className="py-1 px-4 border-b border-gray-300 text-lg text-right w-24">{item.hours}</td>
                     <td className="py-1 pl-2 text-right text-lg border-b border-gray-300 w-32">${((item.rate || 0) * (item.hours || 0)).toFixed(2)}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
             
              <div className="flex justify-end mb-16 mt-8">
               <div className="w-1/2">
                 <div className="flex justify-between py-2">
                   <span className="text-lg">Sub Total</span>
                   <span className="text-lg">${subTotal.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between items-center py-2 border-b-2 border-gray-300">
                   <span className="text-lg">Package Discount ({invoice.discount}%)</span>
                   <span className="text-lg">-${discountAmount.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between py-4">
                   <span className="text-xl font-bold">TOTAL</span>
                   <span className="text-xl font-bold">${total.toFixed(2)}</span>
                 </div>
               </div>
             </div>
             
             <div className="mt-auto">
               <div className="text-gray-500 text-sm whitespace-pre-line">{invoice.notes}</div>
               <p className="mt-4 text-gray-500 text-sm">Thank you for your business.</p>
             </div>
      </div>
    </>
  );

  return (
    <div className="bg-gray-100 p-8 font-serif">
      <div className="max-w-4xl mx-auto">
        {isNew ? renderEditableForm() : renderStaticView()}
      </div>
    </div>
  );
};

export default InvoiceDetail; 