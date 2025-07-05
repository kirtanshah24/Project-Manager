import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { taskAPI } from '../utils/api';

const TaskContext = createContext();

const initialState = {
  tasks: [],
  loading: false,
  error: null,
  stats: null,
  filters: {
    status: '',
    priority: '',
    search: '',
    projectId: '',
    assignee: '',
    dueDate: ''
  },
  pagination: {
    page: 1,
    limit: 10,
    totalPages: 0,
    totalDocs: 0
  }
};

const taskReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_TASKS':
      return { 
        ...state, 
        tasks: action.payload.docs || action.payload,
        pagination: {
          page: action.payload.page || 1,
          limit: action.payload.limit || 10,
          totalPages: action.payload.totalPages || 0,
          totalDocs: action.payload.totalDocs || 0
        },
        loading: false,
        error: null
      };
    
    case 'ADD_TASK':
      return { 
        ...state, 
        tasks: [action.payload, ...state.tasks],
        loading: false,
        error: null
      };
    
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task => 
          task._id === action.payload._id ? action.payload : task
        ),
        loading: false,
        error: null
      };
    
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task._id !== action.payload),
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

export const TaskProvider = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  // Load tasks with filters and pagination
  const loadTasks = useCallback(async (params = {}) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const queryParams = {
        page: state.pagination.page,
        limit: state.pagination.limit,
        ...state.filters,
        ...params
      };

      const response = await taskAPI.getTasks(queryParams);
      
      if (response.success) {
        dispatch({ type: 'SET_TASKS', payload: response.data });
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message });
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load tasks' });
    }
  }, [state.pagination.page, state.pagination.limit, state.filters]);

  // Add new task
  const addTask = useCallback(async (taskData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await taskAPI.addTask(taskData);
      
      if (response.success) {
        dispatch({ type: 'ADD_TASK', payload: response.data.task });
        return { success: true, data: response.data.task };
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message });
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Error adding task:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add task' });
      return { success: false, message: 'Failed to add task' };
    }
  }, []);

  // Update task
  const updateTask = useCallback(async (id, taskData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await taskAPI.updateTask(id, taskData);
      
      if (response.success) {
        dispatch({ type: 'UPDATE_TASK', payload: response.data.task });
        return { success: true, data: response.data.task };
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message });
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Error updating task:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update task' });
      return { success: false, message: 'Failed to update task' };
    }
  }, []);

  // Delete task
  const deleteTask = useCallback(async (id) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await taskAPI.deleteTask(id);
      
      if (response.success) {
        dispatch({ type: 'DELETE_TASK', payload: id });
        return { success: true };
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message });
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete task' });
      return { success: false, message: 'Failed to delete task' };
    }
  }, []);

  // Update task status
  const updateTaskStatus = useCallback(async (id, status) => {
    try {
      const response = await taskAPI.updateTaskStatus(id, status);
      
      if (response.success) {
        dispatch({ type: 'UPDATE_TASK', payload: response.data.task });
        return { success: true, data: response.data.task };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      return { success: false, message: 'Failed to update task status' };
    }
  }, []);

  // Add time entry
  const addTimeEntry = useCallback(async (id, timeEntryData) => {
    try {
      const response = await taskAPI.addTimeEntry(id, timeEntryData);
      
      if (response.success) {
        dispatch({ type: 'UPDATE_TASK', payload: response.data.task });
        return { success: true, data: response.data.task };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Error adding time entry:', error);
      return { success: false, message: 'Failed to add time entry' };
    }
  }, []);

  // Load task statistics
  const loadTaskStats = useCallback(async () => {
    try {
      const response = await taskAPI.getTaskStats();
      
      if (response.success) {
        dispatch({ type: 'SET_STATS', payload: response.data });
      }
    } catch (error) {
      console.error('Error loading task stats:', error);
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

  // Load tasks on mount and when filters/pagination change
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Load stats on mount
  useEffect(() => {
    loadTaskStats();
  }, [loadTaskStats]);

  const value = {
    ...state,
    loadTasks,
    addTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    addTimeEntry,
    loadTaskStats,
    setFilters,
    setPagination,
    clearError
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTask = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
}; 