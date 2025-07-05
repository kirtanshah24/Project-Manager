import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import { expenseAPI } from '../utils/api';

const ExpenseContext = createContext();

const initialState = {
  expenses: [],
  loading: false,
  error: null,
  stats: null,
  filters: {
    projectId: '',
    taskId: '',
    category: '',
    search: '',
    startDate: '',
    endDate: ''
  },
  pagination: {
    page: 1,
    limit: 10,
    totalPages: 0,
    totalDocs: 0
  }
};

const expenseReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_EXPENSES':
      return { 
        ...state, 
        expenses: action.payload.docs || action.payload,
        pagination: {
          page: action.payload.page || 1,
          limit: action.payload.limit || 10,
          totalPages: action.payload.totalPages || 0,
          totalDocs: action.payload.totalDocs || 0
        },
        loading: false,
        error: null
      };
    
    case 'ADD_EXPENSE':
      return { 
        ...state, 
        expenses: [action.payload, ...state.expenses],
        loading: false,
        error: null
      };
    
    case 'UPDATE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.map(expense => 
          expense._id === action.payload._id ? action.payload : expense
        ),
        loading: false,
        error: null
      };
    
    case 'DELETE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.filter(expense => expense._id !== action.payload),
        loading: false,
        error: null
      };
    
    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
        pagination: { ...state.pagination, page: 1 }
      };
    
    case 'SET_PAGINATION':
      return {
        ...state,
        pagination: { ...state.pagination, ...action.payload }
      };
    
    case 'SET_STATS':
      return {
        ...state,
        stats: action.payload,
        loading: false,
        error: null
      };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    default:
      return state;
  }
};

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
};

export const ExpenseProvider = ({ children }) => {
  const [state, dispatch] = useReducer(expenseReducer, initialState);

  // Load expenses with filters and pagination
  const loadExpenses = useCallback(async (params = {}) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const queryParams = {
        page: state.pagination.page,
        limit: state.pagination.limit,
        ...state.filters,
        ...params
      };

      const response = await expenseAPI.getExpenses(queryParams);
      
      if (response.success) {
        dispatch({ type: 'SET_EXPENSES', payload: response.data });
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message });
      }
    } catch (error) {
      console.error('Error loading expenses:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load expenses' });
    }
  }, [state.pagination.page, state.pagination.limit, state.filters]);

  // Add new expense
  const addExpense = useCallback(async (expenseData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await expenseAPI.addExpense(expenseData);
      
      if (response.success) {
        dispatch({ type: 'ADD_EXPENSE', payload: response.data.expense });
        toast.success('Expense added successfully!');
        return { success: true, data: response.data.expense };
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message });
        toast.error(response.message);
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Error adding expense:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add expense' });
      toast.error('Failed to add expense');
      return { success: false, message: 'Failed to add expense' };
    }
  }, []);

  // Update expense
  const updateExpense = useCallback(async (id, expenseData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await expenseAPI.updateExpense(id, expenseData);
      
      if (response.success) {
        dispatch({ type: 'UPDATE_EXPENSE', payload: response.data.expense });
        toast.success('Expense updated successfully!');
        return { success: true, data: response.data.expense };
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message });
        toast.error(response.message);
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Error updating expense:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update expense' });
      toast.error('Failed to update expense');
      return { success: false, message: 'Failed to update expense' };
    }
  }, []);

  // Delete expense
  const deleteExpense = useCallback(async (id) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await expenseAPI.deleteExpense(id);
      
      if (response.success) {
        dispatch({ type: 'DELETE_EXPENSE', payload: id });
        toast.success('Expense deleted successfully!');
        return { success: true };
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message });
        toast.error(response.message);
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete expense' });
      toast.error('Failed to delete expense');
      return { success: false, message: 'Failed to delete expense' };
    }
  }, []);

  // Update expense reimbursement status
  const updateExpenseReimbursement = useCallback(async (id, reimbursementData) => {
    try {
      const response = await expenseAPI.updateExpenseReimbursement(id, reimbursementData);
      
      if (response.success) {
        dispatch({ type: 'UPDATE_EXPENSE', payload: response.data.expense });
        toast.success('Expense reimbursement status updated!');
        return { success: true, data: response.data.expense };
      } else {
        toast.error(response.message);
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Error updating expense reimbursement:', error);
      toast.error('Failed to update expense reimbursement status');
      return { success: false, message: 'Failed to update expense reimbursement status' };
    }
  }, []);

  // Load expense statistics
  const loadExpenseStats = useCallback(async (params = {}) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await expenseAPI.getExpenseStats(params);
      
      if (response.success) {
        dispatch({ type: 'SET_STATS', payload: response.data.stats });
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message });
      }
    } catch (error) {
      console.error('Error loading expense stats:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load expense statistics' });
    }
  }, []);

  // Set filters
  const setFilters = useCallback((filters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  // Set pagination
  const setPagination = useCallback((pagination) => {
    dispatch({ type: 'SET_PAGINATION', payload: pagination });
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // Load expenses on mount and when filters/pagination change
  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const value = {
    expenses: state.expenses,
    loading: state.loading,
    error: state.error,
    stats: state.stats,
    filters: state.filters,
    pagination: state.pagination,
    loadExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
    updateExpenseReimbursement,
    loadExpenseStats,
    setFilters,
    setPagination,
    clearError
  };

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  );
}; 