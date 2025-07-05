import express from 'express';
import {
  getExpenses,
  getExpenseById,
  addExpense,
  updateExpense,
  deleteExpense,
  getExpenseStats,
  updateExpenseReimbursement
} from '../controllers/expenseController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Get all expenses with filtering and pagination
router.get('/', getExpenses);

// Get expense statistics
router.get('/stats', getExpenseStats);

// Get expense by ID
router.get('/:id', getExpenseById);

// Add new expense
router.post('/', addExpense);

// Update expense
router.put('/:id', updateExpense);

// Update expense reimbursement status
router.patch('/:id/reimbursement', updateExpenseReimbursement);

// Delete expense
router.delete('/:id', deleteExpense);

export default router; 