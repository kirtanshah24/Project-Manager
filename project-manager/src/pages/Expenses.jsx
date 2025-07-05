import React, { useState, useEffect } from 'react';
import { useProjects } from '../context/ProjectContext';
import { useTask } from '../context/TaskContext';
import { useExpenses } from '../context/ExpenseContext';

const Expenses = () => {
  const { projects } = useProjects();
  const { tasks } = useTask();
  const { 
    expenses, 
    loading, 
    stats, 
    addExpense, 
    deleteExpense,
    loadExpenseStats 
  } = useExpenses();

  const [showAddModal, setShowAddModal] = useState(false);
  const [expenseData, setExpenseData] = useState({
    projectId: '',
    taskId: '',
    description: '',
    amount: ''
  });

  // Load stats on component mount
  useEffect(() => {
    loadExpenseStats();
  }, [loadExpenseStats]);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    
    const result = await addExpense({
      ...expenseData,
      amount: parseFloat(expenseData.amount),
      date: new Date().toISOString().split('T')[0],
      category: 'other'
    });

    if (result.success) {
      setExpenseData({
        projectId: '',
        taskId: '',
        description: '',
        amount: ''
      });
      setShowAddModal(false);
    }
  };

  const handleDeleteExpense = async (id) => {
    if (window.confirm('Delete this expense?')) {
      await deleteExpense(id);
    }
  };

  const getProjectTasks = (projectId) => {
    return tasks.filter(task => task.projectId === projectId);
  };

  const getTaskExpenses = (taskId) => {
    return expenses.filter(expense => expense.taskId?._id === taskId);
  };

  const getTaskTotalExpenses = (taskId) => {
    const taskExpenses = getTaskExpenses(taskId);
    return taskExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  };

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
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          <p className="text-gray-600">Track expenses for your tasks</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Add Expense
        </button>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total Expenses"
            value={`$${stats.totalAmount.toLocaleString()}`}
            subtitle={`${stats.totalCount} entries`}
            icon="💳"
            color="bg-red-100 text-red-600"
          />
          <StatCard
            title="This Month"
            value={`$${stats.monthly.find(m => m._id === new Date().getMonth() + 1)?.total.toLocaleString() || '0'}`}
            subtitle="Current month"
            icon="📅"
            color="bg-blue-100 text-blue-600"
          />
          <StatCard
            title="Active Tasks"
            value={tasks.filter(t => t.status !== 'completed').length}
            subtitle="With expenses"
            icon="✅"
            color="bg-green-100 text-green-600"
          />
        </div>
      )}

      {/* Tasks with Expenses */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Tasks & Expenses</h2>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading...</p>
            </div>
          ) : tasks.length > 0 ? (
            <div className="space-y-6">
              {tasks.map((task) => {
                const taskExpenses = getTaskExpenses(task._id);
                const totalExpenses = getTaskTotalExpenses(task._id);
                const project = projects.find(p => p._id === task.projectId);
                
                return (
                  <div key={task._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium text-gray-900">{task.title}</h3>
                        <p className="text-sm text-gray-500">{project?.name}</p>
                        <p className="text-sm text-gray-600">{task.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-red-600">
                          ${totalExpenses.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {taskExpenses.length} expense{taskExpenses.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    
                    {taskExpenses.length > 0 && (
                      <div className="space-y-2">
                        {taskExpenses.map((expense) => (
                          <div key={expense._id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                            <span className="text-sm text-gray-700">{expense.description}</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-red-600">
                                ${expense.amount.toFixed(2)}
                              </span>
                              <button
                                onClick={() => handleDeleteExpense(expense._id)}
                                className="text-xs text-red-500 hover:text-red-700"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No tasks found. Create some tasks first to add expenses.</p>
            </div>
          )}
        </div>
      </div>

      {/* Simple Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Add Expense</h2>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task *</label>
                <select
                  required
                  value={expenseData.taskId}
                  onChange={(e) => {
                    const task = tasks.find(t => t._id === e.target.value);
                    setExpenseData({ 
                      ...expenseData, 
                      taskId: e.target.value,
                      projectId: task?.projectId || ''
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Task</option>
                  {tasks.map(task => {
                    const project = projects.find(p => p._id === task.projectId);
                    return (
                      <option key={task._id} value={task._id}>
                        {task.title} - {project?.name}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <input
                  type="text"
                  required
                  placeholder="What was this expense for?"
                  value={expenseData.description}
                  onChange={(e) => setExpenseData({ ...expenseData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={expenseData.amount}
                  onChange={(e) => setExpenseData({ ...expenseData, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setExpenseData({
                      projectId: '',
                      taskId: '',
                      description: '',
                      amount: ''
                    });
                  }}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Add Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses; 