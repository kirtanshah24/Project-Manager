import express from 'express';
import {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  updateInvoiceStatus,
  uploadInvoiceFile
} from '../controllers/invoiceController.js';
// import upload from '../middlewares/uploadMiddleware.js'; // Uncomment if you have a file upload middleware

const router = express.Router();

router.post('/', createInvoice);
router.get('/', getInvoices);
router.get('/:id', getInvoiceById);
router.put('/:id', updateInvoice);
router.delete('/:id', deleteInvoice);
router.patch('/:id/status', updateInvoiceStatus);
// router.post('/:id/upload', upload.single('file'), uploadInvoiceFile); // Uncomment if using file upload

export default router; 