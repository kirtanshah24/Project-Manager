import React, { useState } from 'react'
import { useProjects } from '../context/ProjectContext'
import { useClients } from '../context/ClientContext'
import { Link } from 'react-router-dom';

const Projects = () => {
  const { projects, addProject, updateProject, deleteProject, getProjectTasks } = useProjects()
  const { clients } = useClients()
  const [showModal, setShowModal] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    clientId: '',
    deadline: '',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const client = clients.find(c => c.id === formData.clientId)
    
    if (editingProject) {
      updateProject(editingProject.id, {
        ...formData,
        clientName: client?.name || ''
      })
    } else {
      addProject({
        ...formData,
        clientName: client?.name || ''
      })
    }
    
    setFormData({
      name: '',
      description: '',
      clientId: '',
      deadline: '',
    })
    setEditingProject(null)
    setShowModal(false)
  }

  const handleEdit = (project) => {
    setEditingProject(project)
    setFormData({
      name: project.name,
      description: project.description,
      clientId: project.clientId,
      deadline: project.deadline,
    })
    setShowModal(true)
  }

  const handleDelete = (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      deleteProject(projectId)
    }
  }

  const getProjectHealth = (project) => {
    if (project.status === 'completed') {
      return { text: 'Completed', color: 'bg-blue-100 text-blue-800' };
    }
    if (project.status === 'on-hold') {
      return { text: 'On Hold', color: 'bg-yellow-100 text-yellow-800' };
    }

    const projectTasks = getProjectTasks(project.id);
    const overdueTasks = projectTasks.filter(
      (task) => task.status !== 'completed' && task.dueDate && new Date(task.dueDate) < new Date()
    );

    if (overdueTasks.length > 0) {
      return { text: 'Overdue', color: 'bg-red-100 text-red-800' };
    }

    if (project.endDate) {
      const oneWeekFromNow = new Date();
      oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
      if (new Date(project.endDate) < oneWeekFromNow) {
        return { text: 'At Risk', color: 'bg-yellow-100 text-yellow-800' };
      }
    }

    return { text: 'On Track', color: 'bg-green-100 text-green-800' };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'on-hold': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getClientName = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    return client?.name || 'N/A';
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'on-hold': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600">Manage your client projects</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          New Project
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => {
          const projectTasks = getProjectTasks(project.id)
          const completedTasks = projectTasks.filter(task => task.status === 'completed').length
          const totalTasks = projectTasks.length
          const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
          const health = getProjectHealth(project);

          return (
            <div key={project.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col">
              <div className="p-6 flex-grow">
                <Link to={`/projects/${project.id}`} className="block">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-xl text-gray-900 mb-2">{project.name}</h3>
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusChip(project.status)}`}>
                      {project.status}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{project.description}</p>
                </Link>
                
                <div className="text-sm text-gray-500">
                  <p className="mb-2">
                    <span className="font-semibold">Client:</span> {getClientName(project.clientId) || 'N/A'}
                  </p>
                  {project.deadline && (
                    <p>
                      <span className="font-semibold">Deadline:</span> {new Date(project.deadline).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 border-t border-gray-200 flex items-center justify-end space-x-2">
                <Link to={`/projects/${project.id}#tasks`} className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors">Tasks</Link>
                <Link to={`/projects/${project.id}#expenses`} className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors">Expenses</Link>
                <button
                  onClick={() => handleEdit(project)}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(project.id)}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📁</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
          <p className="text-gray-500 mb-4">Get started by creating your first project</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Create Project
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {editingProject ? 'Edit Project' : 'New Project'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client
                </label>
                <select
                  required
                  value={formData.clientId}
                  onChange={(e) => setFormData({...formData, clientId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a client</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deadline
                  </label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  {editingProject ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingProject(null)
                    setFormData({
                      name: '',
                      description: '',
                      clientId: '',
                      deadline: '',
                    })
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
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