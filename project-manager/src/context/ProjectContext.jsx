import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react'
import { toast } from 'react-toastify'
import { projectAPI } from '../utils/api'

const ProjectContext = createContext()

const initialState = {
  projects: [],
  loading: false,
  error: null,
  stats: null,
  filters: {
    status: '',
    priority: '',
    search: '',
    clientId: '',
    startDate: '',
    endDate: ''
  },
  pagination: {
    page: 1,
    limit: 10,
    totalPages: 0,
    totalDocs: 0
  }
}

const projectReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }
    
    case 'SET_PROJECTS':
      return { 
        ...state, 
        projects: action.payload.docs || action.payload,
        pagination: {
          page: action.payload.page || 1,
          limit: action.payload.limit || 10,
          totalPages: action.payload.totalPages || 0,
          totalDocs: action.payload.totalDocs || 0
        },
        loading: false,
        error: null
      }
    
    case 'ADD_PROJECT':
      return { 
        ...state, 
        projects: [action.payload, ...state.projects],
        loading: false,
        error: null
      }
    
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(project => 
          project._id === action.payload._id ? action.payload : project
        ),
        loading: false,
        error: null
      }
    
    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter(project => project._id !== action.payload),
        loading: false,
        error: null
      }
    
    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
        pagination: { ...state.pagination, page: 1 }
      }
    
    case 'SET_PAGINATION':
      return {
        ...state,
        pagination: { ...state.pagination, ...action.payload }
      }
    
    case 'SET_STATS':
      return {
        ...state,
        stats: action.payload,
        loading: false,
        error: null
      }
    
    case 'CLEAR_ERROR':
      return { ...state, error: null }
    
    default:
      return state
  }
}

export const useProjects = () => {
  const context = useContext(ProjectContext)
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider')
  }
  return context
}

export const ProjectProvider = ({ children }) => {
  const [state, dispatch] = useReducer(projectReducer, initialState)

  // Load projects with filters and pagination
  const loadProjects = useCallback(async (params = {}) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const queryParams = {
        page: state.pagination.page,
        limit: state.pagination.limit,
        ...state.filters,
        ...params
      }

      const response = await projectAPI.getProjects(queryParams)
      
      if (response.success) {
        dispatch({ type: 'SET_PROJECTS', payload: response.data })
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message })
      }
    } catch (error) {
      console.error('Error loading projects:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load projects' })
    }
  }, [state.pagination.page, state.pagination.limit, state.filters])

  // Add new project
  const addProject = useCallback(async (projectData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const response = await projectAPI.addProject(projectData)
      
      if (response.success) {
        dispatch({ type: 'ADD_PROJECT', payload: response.data.project })
        return { success: true, data: response.data.project }
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message })
        return { success: false, message: response.message }
      }
    } catch (error) {
      console.error('Error adding project:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add project' })
      return { success: false, message: 'Failed to add project' }
    }
  }, [])

  // Update project
  const updateProject = useCallback(async (id, projectData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const response = await projectAPI.updateProject(id, projectData)
      
      if (response.success) {
        dispatch({ type: 'UPDATE_PROJECT', payload: response.data.project })
        return { success: true, data: response.data.project }
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message })
        return { success: false, message: response.message }
      }
    } catch (error) {
      console.error('Error updating project:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update project' })
      return { success: false, message: 'Failed to update project' }
    }
  }, [])

  // Delete project
  const deleteProject = useCallback(async (id) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const response = await projectAPI.deleteProject(id)
      
      if (response.success) {
        dispatch({ type: 'DELETE_PROJECT', payload: id })
        return { success: true }
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message })
        return { success: false, message: response.message }
      }
    } catch (error) {
      console.error('Error deleting project:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete project' })
      return { success: false, message: 'Failed to delete project' }
    }
  }, [])

  // Archive/Unarchive project
  const toggleArchiveProject = useCallback(async (id, isArchived) => {
    try {
      const response = await projectAPI.toggleArchiveProject(id, isArchived)
      
      if (response.success) {
        dispatch({ type: 'UPDATE_PROJECT', payload: response.data.project })
        return { success: true, data: response.data.project }
      } else {
        return { success: false, message: response.message }
      }
    } catch (error) {
      console.error('Error toggling project archive:', error)
      return { success: false, message: 'Failed to toggle project archive' }
    }
  }, [])

  // Load project statistics
  const loadProjectStats = useCallback(async () => {
    try {
      const response = await projectAPI.getProjectStats()
      
      if (response.success) {
        dispatch({ type: 'SET_STATS', payload: response.data })
      }
    } catch (error) {
      console.error('Error loading project stats:', error)
    }
  }, [])

  // Set filters
  const setFilters = useCallback((filters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters })
  }, [])

  // Set pagination
  const setPagination = useCallback((pagination) => {
    dispatch({ type: 'SET_PAGINATION', payload: pagination })
  }, [])

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' })
  }, [])

  // Load projects on mount and when filters/pagination change
  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  // Load stats on mount
  useEffect(() => {
    loadProjectStats()
  }, [loadProjectStats])

  const value = {
    ...state,
    loadProjects,
    addProject,
    updateProject,
    deleteProject,
    toggleArchiveProject,
    loadProjectStats,
    setFilters,
    setPagination,
    clearError
  }

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  )
} 