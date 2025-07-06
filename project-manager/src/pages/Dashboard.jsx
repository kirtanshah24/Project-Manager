import React from 'react'
import { useProjects } from '../context/ProjectContext'
import { useClients } from '../context/ClientContext'
import { useTask } from '../context/TaskContext'
import { useExpenses } from '../context/ExpenseContext'
import { formatINR } from '../utils/api'

const Dashboard = () => {
  const { projects } = useProjects()
  const { clients, invoices } = useClients()
  const { tasks } = useTask()
  const { expenses } = useExpenses()

  // Calculate statistics
  const activeProjects = projects.filter(p => p.status === 'active').length
  const completedProjects = projects.filter(p => p.status === 'completed').length
  const pendingTasks = tasks.filter(t => t.status === 'pending').length
  const completedTasks = tasks.filter(t => t.status === 'completed').length
  
  const totalRevenue = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0)
  
  const pendingInvoices = invoices.filter(inv => inv.status === 'pending').length
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)

  const recentProjects = projects
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)

  const upcomingDeadlines = tasks
    .filter(task => task.dueDate && new Date(task.dueDate) > new Date())
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5)

  const StatCard = ({ title, value, subtitle, icon, color }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color}`}>
          <span className="text-2xl">{icon}</span>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to your project management dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Projects"
          value={activeProjects}
          subtitle={`${completedProjects} completed`}
          icon="📁"
          color="bg-blue-100 text-blue-600"
        />
        <StatCard
          title="Pending Tasks"
          value={pendingTasks}
          subtitle={`${completedTasks} completed`}
          icon="✅"
          color="bg-green-100 text-green-600"
        />
        <StatCard
          title="Total Revenue"
          value={formatINR(totalRevenue)}
          subtitle={`${pendingInvoices} pending invoices`}
          icon="💰"
          color="bg-yellow-100 text-yellow-600"
        />
        <StatCard
          title="Total Expenses"
          value={formatINR(totalExpenses)}
          subtitle={`${expenses.length} entries`}
          icon="💳"
          color="bg-red-100 text-red-600"
        />
      </div>

      {/* Recent Projects and Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Projects</h2>
          </div>
          <div className="p-6">
            {recentProjects.length > 0 ? (
              <div className="space-y-4">
                {recentProjects.map((project) => (
                  <div key={project._id} className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{project.name}</h3>
                      <p className="text-sm text-gray-500">{project.clientName}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      project.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No projects yet</p>
            )}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Deadlines</h2>
          </div>
          <div className="p-6">
            {upcomingDeadlines.length > 0 ? (
              <div className="space-y-4">
                {upcomingDeadlines.map((task) => (
                  <div key={task._id} className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{task.title}</h3>
                      <p className="text-sm text-gray-500">{task.projectName}</p>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No upcoming deadlines</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:text-blue-500 transition-colors">
            <div className="text-center">
              <div className="text-2xl mb-2">➕</div>
              <div className="text-sm font-medium">New Project</div>
            </div>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:text-blue-500 transition-colors">
            <div className="text-center">
              <div className="text-2xl mb-2">👤</div>
              <div className="text-sm font-medium">Add Client</div>
            </div>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:text-blue-500 transition-colors">
            <div className="text-center">
              <div className="text-2xl mb-2">✅</div>
              <div className="text-sm font-medium">Create Task</div>
            </div>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:text-blue-500 transition-colors">
            <div className="text-center">
              <div className="text-2xl mb-2">💰</div>
              <div className="text-sm font-medium">New Invoice</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard 