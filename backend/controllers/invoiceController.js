import Invoice from '../models/InvoiceModel.js';
import Client from '../models/ClientModel.js';
import Project from '../models/ProjectModel.js';

// Create a new invoice
export const createInvoice = async (req, res) => {
  try {
    const invoice = new Invoice(req.body);
    await invoice.save();
    res.status(201).json(invoice);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all invoices (optionally filter by clientId, projectId, status)
export const getInvoices = async (req, res) => {
  try {
    const { clientId, projectId, status } = req.query;
    const filter = {};
    if (clientId) filter.clientId = clientId;
    if (projectId) filter.projectId = projectId;
    if (status) filter.status = status;
    const invoices = await Invoice.find(filter).sort({ createdAt: -1 });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single invoice by ID
export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update an invoice
export const updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    res.json(invoice);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete an invoice
export const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    res.json({ message: 'Invoice deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update invoice status
export const updateInvoiceStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    res.json(invoice);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// (Optional) Upload invoice file (set fileUrl)
export const uploadInvoiceFile = async (req, res) => {
  try {
    // Assume file upload middleware sets req.file and req.file.path
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { fileUrl: req.file.path },
      { new: true }
    );
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    res.json(invoice);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}; 