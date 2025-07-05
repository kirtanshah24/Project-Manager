import React, { useState, useEffect } from 'react'
import { useTask } from '../context/TaskContext'
import { useProjects } from '../context/ProjectContext'
import { useClients } from '../context/ClientContext'
import { toast } from 'react-toastify'

const Tasks = () => {
  const { 
    tasks, 
    loading, 
    error, 
    stats,
    addTask, 
    updateTask, 
    deleteTask, 
    updateTaskStatus,
    setFilters,
    setPagination,
    clearError
  } = useTask()
  
  const { projects, loadProjects } = useProjects()
  const { clients, loadClients } = useClients()
  
  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    dueDate: '',
    projectId: '',
    isRecurring: false,
    recurringPattern: 'weekly',
    recurringInterval: 1,
    recurringEndDate: '',
    recurringCount: 0,
    tags: [],
    assignee: '',
    dependencies: []
  })
  const [tagInput, setTagInput] = useState('')

  // Load projects and clients on mount
  useEffect(() => {
    loadProjects()
    loadClients()
  }, [loadProjects, loadClients])

  // Clear error when component mounts
  useEffect(() => {
    if (error) {
      toast.error(error)
      clearError()
    }
  }, [error, clearError])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      toast.error('Task title is required')
      return
    }

    const taskData = {
      ...formData,
      projectId: formData.projectId || null,
      assignee: formData.assignee || null,
      dueDate: formData.dueDate || null,
      recurringEndDate: formData.recurringEndDate || null
    }
    
    try {
      if (editingTask) {
        const result = await updateTask(editingTask._id, taskData)
        if (result.success) {
          toast.success('Task updated successfully')
          setShowModal(false)
          setEditingTask(null)
          resetForm()
        } else {
          toast.error(result.message || 'Failed to update task')
        }
      } else {
        const result = await addTask(taskData)
        if (result.success) {
          toast.success('Task created successfully')
          setShowModal(false)
          resetForm()
        } else {
          toast.error(result.message || 'Failed to create task')
        }
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  const handleEdit = (task) => {
    setEditingTask(task)
    setFormData({
      title: task.title || '',
      description: task.description || '',
      status: task.status || 'pending',
      priority: task.priority || 'medium',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      projectId: task.projectId?._id || task.projectId || '',
      isRecurring: task.isRecurring || false,
      recurringPattern: task.recurringPattern || 'weekly',
      recurringInterval: task.recurringInterval || 1,
      recurringEndDate: task.recurringEndDate ? new Date(task.recurringEndDate).toISOString().split('T')[0] : '',
      recurringCount: task.recurringCount || 0,
      tags: task.tags || [],
      assignee: task.assignee?._id || task.assignee || '',
      dependencies: task.dependencies || []
    })
    setShowModal(true)
  }

  const handleDelete = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const result = await deleteTask(taskId)
        if (result.success) {
          toast.success('Task deleted successfully')
        } else {
          toast.error(result.message || 'Failed to delete task')
        }
      } catch (error) {
        toast.error('An error occurred')
      }
    }
  }

  const handleStatusChange = async (taskId, status) => {
    try {
      const result = await updateTaskStatus(taskId, status)
      if (result.success) {
        toast.success('Task status updated')
      } else {
        toast.error(result.message || 'Failed to update status')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      status: 'pending',
      priority: 'medium',
      dueDate: '',
      projectId: '',
      isRecurring: false,
      recurringPattern: 'weekly',
      recurringInterval: 1,
      recurringEndDate: '',
      recurringCount: 0,
      tags: [],
      assignee: '',
      dependencies: []
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in-progress': return 'bg-blue-100 text-blue-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const isOverdue = (dueDate) => {
    return dueDate && new Date(dueDate) < new Date()
  }

  const getProjectName = (task) => {
    if (!task.projectId) return 'No project'
    if (typeof task.projectId === 'object' && task.projectId.name) {
      return task.projectId.name
    }
    const project = projects.find(p => p._id === task.projectId)
    return project?.name || 'Unknown project'
  }

  const getClientName = (task) => {
    if (!task.projectId) return ''
    if (typeof task.projectId === 'object' && task.projectId.clientId) {
      if (typeof task.projectId.clientId === 'object' && task.projectId.clientId.name) {
        return task.projectId.clientId.name
      }
      const client = clients.find(c => c._id === task.projectId.clientId)
      return client?.name || ''
    }
    return ''
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 px-2 lg:px-0">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-sm lg:text-base text-gray-600">Manage your project tasks and track progress</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors w-full sm:w-auto"
        >
          New Task
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-blue-600 text-xl">📋</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overview?.total || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-yellow-600 text-xl">⏳</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overview?.pending || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-blue-600 text-xl">🔄</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overview?.inProgress || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-green-600 text-xl">✅</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overview?.completed || 0}</p>
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
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
            <select
              onChange={(e) => setFilters({ projectId: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Projects</option>
              {projects.map(project => (
                <option key={project._id} value={project._id}>{project.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search tasks..."
              onChange={(e) => setFilters({ search: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-white rounded-lg shadow overflow-x-auto border border-gray-200">
        <div className="px-4 py-3 lg:px-6 lg:py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">All Tasks</h2>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
            <p className="text-gray-500 mb-4">Create your first task to get started</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Create Task
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {tasks.map((task) => (
              <div key={task._id} className="p-4 lg:p-6 hover:bg-gray-50">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="text-base lg:text-lg font-medium text-gray-900 break-words">{task.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                      {task.isRecurring && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                          🔄 Recurring
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-3 text-sm break-words">{task.description}</p>
                    
                    {/* Tags */}
                    {task.tags && task.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {task.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs lg:text-sm">
                      <div>
                        <span className="text-gray-500">Project:</span>
                        <span className="ml-2 font-medium">{getProjectName(task)}</span>
                      </div>
                      {getClientName(task) && (
                        <div>
                          <span className="text-gray-500">Client:</span>
                          <span className="ml-2 font-medium">{getClientName(task)}</span>
                        </div>
                      )}
                      {task.dueDate && (
                        <div>
                          <span className="text-gray-500">Due:</span>
                          <span className={`ml-2 font-medium ${isOverdue(task.dueDate) ? 'text-red-600' : ''}`}>
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {task.assignee && (
                        <div>
                          <span className="text-gray-500">Assignee:</span>
                          <span className="ml-2 font-medium">
                            {typeof task.assignee === 'object' ? task.assignee.name : 'Unknown'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch gap-2 mt-3 md:mt-0 md:ml-4">
                    {task.status !== 'completed' && (
                      <button
                        onClick={() => handleStatusChange(task._id, 'completed')}
                        className="px-3 py-1 text-xs lg:text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors w-full sm:w-auto"
                      >
                        ✓ Complete
                      </button>
                    )}
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task._id, e.target.value)}
                      className="px-3 py-1 text-xs lg:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <button
                      onClick={() => handleEdit(task)}
                      className="px-3 py-1 text-xs lg:text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors w-full sm:w-auto"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(task._id)}
                      className="px-3 py-1 text-xs lg:text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors w-full sm:w-auto"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-2">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">
              {editingTask ? 'Edit Task' : 'New Task'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Task Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter task title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
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
                  placeholder="Enter task description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                  <select
                    value={formData.projectId}
                    onChange={e => setFormData({ ...formData, projectId: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">No project</option>
                    {projects.map(project => (
                      <option key={project._id} value={project._id}>{project.name}</option>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
                  <select
                    value={formData.assignee}
                    onChange={e => setFormData({ ...formData, assignee: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">No assignee</option>
                    {/* Add user options here when user management is implemented */}
                  </select>
                </div>
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

              {/* Recurring Task Options */}
              <div className="border border-gray-200 rounded-md p-4">
                <div className="flex items-center mb-3">
                  <input
                    type="checkbox"
                    id="isRecurring"
                    checked={formData.isRecurring}
                    onChange={e => setFormData({ ...formData, isRecurring: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700">
                    Recurring Task
                  </label>
                </div>
                {formData.isRecurring && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pattern</label>
                      <select
                        value={formData.recurringPattern}
                        onChange={e => setFormData({ ...formData, recurringPattern: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Interval</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.recurringInterval}
                        onChange={e => setFormData({ ...formData, recurringInterval: parseInt(e.target.value) })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                      <input
                        type="date"
                        value={formData.recurringEndDate}
                        onChange={e => setFormData({ ...formData, recurringEndDate: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button 
                  type="button" 
                  onClick={() => { setShowModal(false); setEditingTask(null); resetForm(); }} 
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  {editingTask ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Tasks 