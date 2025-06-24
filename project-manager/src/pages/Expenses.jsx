import React, { useState } from 'react';
import { useProjects } from '../context/ProjectContext';
import { useClients } from '../context/ClientContext';

const Expenses = () => {
  const { projects } = useProjects();
  const { expenses, addExpense, deleteExpense } = useClients();
  const [selectedProject, setSelectedProject] = useState(null);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [expenseData, setExpenseData] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
  });

  const handleSelectProject = (project) => {
    setSelectedProject(project);
  };

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!selectedProject) return;

    addExpense({
      ...expenseData,
      amount: parseFloat(expenseData.amount),
      projectId: selectedProject.id,
      projectName: selectedProject.name,
    });

    setExpenseData({
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
    });
    setShowAddExpenseModal(false);
  };

  const projectExpenses = selectedProject
    ? expenses.filter((exp) => exp.projectId === selectedProject.id)
    : [];
  
  const totalProjectExpenses = projectExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
        <p className="text-gray-600">Track expenses for your projects.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Project List */}
        <div className="md:col-span-1 bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Your Projects</h2>
          </div>
          <div className="p-4 space-y-2">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => handleSelectProject(project)}
                className={`w-full text-left px-4 py-3 rounded-md transition-colors ${
                  selectedProject?.id === project.id
                    ? 'bg-blue-100 text-blue-800'
                    : 'hover:bg-gray-50'
                }`}
              >
                <h3 className="font-medium">{project.name}</h3>
                <p className="text-sm text-gray-500">{project.clientName}</p>
              </button>
            ))}
            {projects.length === 0 && <p className="text-gray-500 p-4">No projects found.</p>}
          </div>
        </div>

        {/* Expense Details */}
        <div className="md:col-span-2 bg-white rounded-lg shadow">
          {selectedProject ? (
            <div>
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Expenses for: {selectedProject.name}
                  </h2>
                  <p className="text-sm text-gray-500">Total: ${totalProjectExpenses.toFixed(2)}</p>
                </div>
                <button
                  onClick={() => setShowAddExpenseModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Add Expense
                </button>
              </div>

              <div className="p-6">
                {projectExpenses.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {projectExpenses.map((expense) => (
                      <li key={expense.id} className="py-4 flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-800">{expense.description}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(expense.date || expense.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-lg text-red-600">
                            -${expense.amount.toFixed(2)}
                          </p>
                           <button
                              onClick={() => deleteExpense(expense.id)}
                              className="text-xs text-gray-400 hover:text-red-500"
                            >
                              Delete
                            </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No expenses recorded for this project yet.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6 text-center flex items-center justify-center h-full">
              <p className="text-gray-500">Select a project to view its expenses.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Add Expense for {selectedProject.name}</h2>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <input
                  type="text"
                  id="description"
                  required
                  value={expenseData.description}
                  onChange={(e) => setExpenseData({ ...expenseData, description: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                  Amount ($)
                </label>
                <input
                  type="number"
                  id="amount"
                  required
                  value={expenseData.amount}
                  onChange={(e) => setExpenseData({ ...expenseData, amount: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  required
                  value={expenseData.date}
                  onChange={(e) => setExpenseData({ ...expenseData, date: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddExpenseModal(false)}
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