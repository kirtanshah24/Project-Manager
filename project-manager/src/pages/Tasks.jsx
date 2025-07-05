import React, { useState } from 'react'
import { useProjects } from '../context/ProjectContext'

const Tasks = () => {
  const { projects, tasks, addTask, updateTask, deleteTask } = useProjects()
  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: '',
    priority: 'medium',
    dueDate: '',
    isRecurring: false,
    recurringPattern: 'weekly',
    recurrenceCount: 1,
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const project = projects.find(p => p.id === formData.projectId)
    const taskData = {
      ...formData,
      projectId: formData.projectId || null,
      projectName: project?.name || '',
    }
    
    if (editingTask) {
      updateTask(editingTask.id, taskData)
    } else {
      addTask(taskData)
    }
    
    setFormData({
      title: '',
      description: '',
      projectId: '',
      priority: 'medium',
      dueDate: '',
      isRecurring: false,
      recurringPattern: 'weekly',
      recurrenceCount: 1,
    })
    setEditingTask(null)
    setShowModal(false)
  }

  const handleEdit = (task) => {
    setEditingTask(task)
    setFormData({
      title: task.title,
      description: task.description,
      projectId: task.projectId,
      priority: task.priority,
      dueDate: task.dueDate,
      isRecurring: task.isRecurring,
      recurringPattern: task.recurringPattern,
      recurrenceCount: task.recurrenceCount,
    })
    setShowModal(true)
  }

  const handleDelete = (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTask(taskId)
    }
  }

  const handleStatusChange = (taskId, status) => {
    updateTask(taskId, { status })
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in-progress': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const isOverdue = (dueDate) => {
    return dueDate && new Date(dueDate) < new Date()
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 px-2 lg:px-0">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-sm lg:text-base text-gray-600">Manage your project tasks and track time</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors w-full sm:w-auto"
        >
          New Task
        </button>
      </div>

      {/* Tasks List */}
      <div className="bg-white rounded-lg shadow overflow-x-auto border border-gray-200">
        <div className="px-4 py-3 lg:px-6 lg:py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">All Tasks</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {tasks.filter(t => t.isVisible).map((task) => {
            const project = projects.find(p => p.id === task.projectId)

            return (
              <div key={task.id} className="p-4 lg:p-6 hover:bg-gray-50">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs lg:text-sm">
                      <div>
                        <span className="text-gray-500">Project:</span>
                        <span className="ml-2 font-medium">{project?.name || 'No project'}</span>
                      </div>
                      {task.dueDate && (
                        <div>
                          <span className="text-gray-500">Due:</span>
                          <span className={`ml-2 font-medium ${isOverdue(task.dueDate) ? 'text-red-600' : ''}`}>
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch gap-2 mt-3 md:mt-0 md:ml-4">
                    {task.status !== 'completed' && (
                      <button
                        onClick={() => handleStatusChange(task.id, 'completed')}
                        className="px-3 py-1 text-xs lg:text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors w-full sm:w-auto"
                      >
                        ✓ Complete
                      </button>
                    )}
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      className="px-3 py-1 text-xs lg:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                    <button
                      onClick={() => handleEdit(task)}
                      className="px-3 py-1 text-xs lg:text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors w-full sm:w-auto"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
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
        {tasks.length === 0 && (
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
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-2">
          <div className="bg-white rounded-lg p-4 w-full max-w-md mx-auto">
            <h2 className="text-lg font-semibold mb-4">
              {editingTask ? 'Edit Task' : 'New Task'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Task Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Project (optional)</label>
                <select
                  value={formData.projectId}
                  onChange={e => setFormData({ ...formData, projectId: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                >
                  <option value="">No project</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Priority</label>
                <select
                  value={formData.priority}
                  onChange={e => setFormData({ ...formData, priority: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => { setShowModal(false); setEditingTask(null); }} className="px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">{editingTask ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Tasks 