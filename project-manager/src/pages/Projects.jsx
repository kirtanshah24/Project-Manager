import React, { useState, useEffect } from 'react'
import { useProjects } from '../context/ProjectContext'
import { useClients } from '../context/ClientContext'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'

const Projects = () => {
  const { 
    projects, 
    loading, 
    error,
    stats,
    addProject, 
    updateProject, 
    deleteProject, 
    setFilters,
    setPagination,
    clearError
  } = useProjects()
  
  const { clients, loadClients } = useClients()
  
  const [showModal, setShowModal] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    clientId: '',
    status: 'active',
    priority: 'medium',
    startDate: '',
    endDate: '',
    deadline: '',
    budget: '',
    tags: []
  })
  const [tagInput, setTagInput] = useState('')

  // Load clients on mount
  useEffect(() => {
    loadClients()
  }, [loadClients])

  // Clear error when component mounts
  useEffect(() => {
    if (error) {
      toast.error(error)
      clearError()
    }
  }, [error, clearError])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('Project name is required')
      return
    }

    try {
      const projectData = {
        ...formData,
        clientId: formData.clientId || null,
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        deadline: formData.deadline || null
      }
      
      if (editingProject) {
        const result = await updateProject(editingProject._id, projectData)
        if (result.success) {
          toast.success('Project updated successfully')
          setShowModal(false)
          setEditingProject(null)
          resetForm()
        } else {
          toast.error(result.message || 'Failed to update project')
        }
      } else {
        const result = await addProject(projectData)
        if (result.success) {
          toast.success('Project created successfully')
          setShowModal(false)
          resetForm()
        } else {
          toast.error(result.message || 'Failed to create project')
        }
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  const handleEdit = (project) => {
    setEditingProject(project)
    setFormData({
      name: project.name || '',
      description: project.description || '',
      clientId: project.clientId?._id || project.clientId || '',
      status: project.status || 'active',
      priority: project.priority || 'medium',
      startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
      endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
      deadline: project.deadline ? new Date(project.deadline).toISOString().split('T')[0] : '',
      budget: project.budget || '',
      tags: project.tags || []
    })
    setShowModal(true)
  }

  const handleDelete = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project? This will also delete all associated tasks.')) {
      try {
        const result = await deleteProject(projectId)
        if (result.success) {
          toast.success('Project deleted successfully')
        } else {
          toast.error(result.message || 'Failed to delete project')
        }
      } catch (error) {
        toast.error('An error occurred')
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      clientId: '',
      status: 'active',
      priority: 'medium',
      startDate: '',
      endDate: '',
      deadline: '',
      budget: '',
      tags: []
    })
    setTagInput('')
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] })
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove) => {
    setFormData({ ...formData, tags: formData.tags.filter(tag => tag !== tagToRemove) })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'on-hold': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getClientName = (project) => {
    if (project.clientId && typeof project.clientId === 'object') {
      return project.clientId.name || 'N/A'
    }
    if (project.clientId && typeof project.clientId === 'string') {
      const client = clients.find(c => c._id === project.clientId)
      return client?.name || 'N/A'
    }
    return 'N/A'
  }

  const getProjectProgress = (project) => {
    // Simple progress based on status
    switch (project.status) {
      case 'completed':
        return 100
      case 'active':
        return 50
      case 'on-hold':
        return 25
      case 'cancelled':
        return 0
      default:
        return 0
    }
  }

  const isOverdue = (deadline) => {
    return deadline && new Date(deadline) < new Date()
  }

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 px-2 lg:px-0">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-sm lg:text-base text-gray-600">Manage your client projects and track progress</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors w-full sm:w-auto"
        >
          New Project
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-blue-600 text-xl">📁</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overview?.total || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-green-600 text-xl">🔄</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overview?.active || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-blue-600 text-xl">✅</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overview?.completed || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-yellow-600 text-xl">⏸️</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">On Hold</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overview?.onHold || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              onChange={(e) => setFilters({ status: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="on-hold">On Hold</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              onChange={(e) => setFilters({ priority: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
            <select
              onChange={(e) => setFilters({ clientId: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Clients</option>
              {clients.map(client => (
                <option key={client._id} value={client._id}>{client.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search projects..."
              onChange={(e) => setFilters({ search: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className="bg-white rounded-lg shadow overflow-x-auto border border-gray-200">
        <div className="px-4 py-3 lg:px-6 lg:py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">All Projects</h2>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
            <p className="text-gray-500 mb-4">Create your first project to get started</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Create Project
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {projects.map((project) => {
              const progress = getProjectProgress(project)
              const isDeadlineOverdue = isOverdue(project.deadline)

              return (
                <div key={project._id} className="p-4 lg:p-6 hover:bg-gray-50">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-base lg:text-lg font-medium text-gray-900 break-words">{project.name}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(project.priority)}`}>
                          {project.priority}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3 text-sm break-words">{project.description}</p>
                      
                      {/* Tags */}
                      {project.tags && project.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {project.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                              #{tag}
                            </span>
                          ))}
                          {project.tags.length > 3 && (
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                              +{project.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                      
                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-gray-600">Progress</span>
                          <span className="text-xs font-medium text-gray-900">{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs lg:text-sm">
                        <div>
                          <span className="text-gray-500">Client:</span>
                          <span className="ml-2 font-medium">{getClientName(project)}</span>
                        </div>
                        {project.budget && (
                          <div>
                            <span className="text-gray-500">Budget:</span>
                            <span className="ml-2 font-medium">{formatCurrency(project.budget)}</span>
                          </div>
                        )}
                        {project.deadline && (
                          <div>
                            <span className="text-gray-500">Deadline:</span>
                            <span className={`ml-2 font-medium ${isDeadlineOverdue ? 'text-red-600' : ''}`}>
                              {new Date(project.deadline).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {project.startDate && project.endDate && (
                          <div>
                            <span className="text-gray-500">Duration:</span>
                            <span className="ml-2 font-medium">
                              {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch gap-2 mt-3 md:mt-0 md:ml-4">
                      <Link 
                        to={`/projects/${project._id}`} 
                        className="px-3 py-1 text-xs lg:text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors w-full sm:w-auto text-center"
                      >
                        View Details
                      </Link>
                      <Link 
                        to={`/projects/${project._id}#tasks`} 
                        className="px-3 py-1 text-xs lg:text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors w-full sm:w-auto text-center"
                      >
                        Tasks
                      </Link>
                      <button
                        onClick={() => handleEdit(project)}
                        className="px-3 py-1 text-xs lg:text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors w-full sm:w-auto"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(project._id)}
                        className="px-3 py-1 text-xs lg:text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors w-full sm:w-auto"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-2">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">
              {editingProject ? 'Edit Project' : 'New Project'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter project name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="on-hold">On Hold</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter project description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                  <select
                    value={formData.clientId}
                    onChange={e => setFormData({ ...formData, clientId: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">No client</option>
                    {clients.map(client => (
                      <option key={client._id} value={client._id}>{client.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={e => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.budget}
                  onChange={e => setFormData({ ...formData, budget: e.target.value })}
                  placeholder="0.00"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add a tag and press Enter"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {formData.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full flex items-center gap-1">
                        #{tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button 
                  type="button" 
                  onClick={() => { setShowModal(false); setEditingProject(null); resetForm(); }} 
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  {editingProject ? 'Update Project' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Projects 