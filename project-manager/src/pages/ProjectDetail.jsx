import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';
import { useClients } from '../context/ClientContext';
import { useExpenses } from '../context/ExpenseContext';
import { toast } from 'react-toastify';
import { formatINR } from '../utils/api';

// Reusable Card Component
const InfoCard = ({ title, children, actions }) => (
    <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">{title}</h3>
            {actions && <div className="space-x-2">{actions}</div>}
        </div>
        {children}
    </div>
);

const ProjectDetail = () => {
    const { id } = useParams();
    const { projects, tasks, addTask, updateTask, deleteTask } = useProjects();
    const { clients } = useClients();
    const { expenses, addExpense, deleteExpense } = useExpenses();

    const project = projects.find(p => p._id === id);
    const client = clients.find(c => c._id === project?.clientId);
    const projectTasks = tasks.filter(t => t.projectId === id);
    const projectExpenses = expenses.filter(e => e.projectId === id);

    // State for modals
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [taskFormData, setTaskFormData] = useState({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: '',
        status: 'pending',
        isRecurring: false,
        recurringPattern: 'weekly',
        recurrenceCount: 1,
    });

    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [expenseFormData, setExpenseFormData] = useState({ description: '', amount: '' });

    if (!project) {
        return (
            <div className="text-center p-8">
                <h1 className="text-2xl font-bold">Project not found</h1>
                <Link to="/projects" className="text-blue-600 hover:underline">Go back to projects</Link>
            </div>
        );
    }
    
    // Handlers for Tasks
    const handleTaskSubmit = (e) => {
        e.preventDefault();
        if (editingTask) {
            updateTask(editingTask.id, { ...editingTask, ...taskFormData });
            toast.success("Task updated!");
        } else {
            addTask({
                ...taskFormData,
                projectId: id,
                projectName: project.name
            });
            toast.success("Task added!");
        }
        setEditingTask(null);
        setShowTaskModal(false);
        setTaskFormData({
            title: '',
            description: '',
            priority: 'medium',
            dueDate: '',
            status: 'pending',
            isRecurring: false,
            recurringPattern: 'weekly',
            recurrenceCount: 1,
        });
    };

    const handleEditTask = (task) => {
        setEditingTask(task);
        setTaskFormData({
            title: task.title,
            description: task.description,
            priority: task.priority || 'medium',
            dueDate: task.dueDate || '',
            status: task.status || 'pending',
            isRecurring: task.isRecurring || false,
            recurringPattern: task.recurringPattern || 'weekly',
            recurrenceCount: task.recurrenceCount || 1,
        });
        setShowTaskModal(true);
    };

    const handleStatusChange = (taskId, status) => {
        updateTask(taskId, { status });
        toast.info(`Task status updated to ${status}.`);
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'low': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const isOverdue = (dueDate) => dueDate && new Date(dueDate) < new Date();

    // Handlers for Expenses
    const handleExpenseSubmit = async (e) => {
        e.preventDefault();
        const result = await addExpense({ 
            ...expenseFormData, 
            projectId: id, 
            amount: parseFloat(expenseFormData.amount) 
        });
        if (result.success) {
            setShowExpenseModal(false);
            setExpenseFormData({ description: '', amount: '' });
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <Link to="/projects" className="text-blue-600 hover:underline mb-4 block">&larr; All Projects</Link>
                <h1 className="text-3xl font-extrabold text-gray-900">{project.name}</h1>
                <p className="text-lg text-gray-600 mt-1">{project.description}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Tasks */}
                    <InfoCard 
                        title="Tasks" 
                        actions={<button onClick={() => setShowTaskModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-semibold">Add Task</button>}
                    >
                        <div className="divide-y divide-gray-200">
                            {projectTasks.map(task => (
                                <div key={task.id} className="p-4 hover:bg-gray-50">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                                                    {task.priority}
                                                </span>
                                                {task.isRecurring && (
                                                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                                                    🔄 Recurring
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-gray-600 mb-3">{task.description}</p>
                                            {task.dueDate && (
                                                <div className="text-sm">
                                                    <span className="text-gray-500">Due:</span>
                                                    <span className={`ml-2 font-medium ${isOverdue(task.dueDate) ? 'text-red-600' : ''}`}>
                                                        {new Date(task.dueDate).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center space-x-2 ml-4">
                                            {task.status !== 'completed' && (
                                                <button onClick={() => handleStatusChange(task.id, 'completed')} className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200">
                                                    ✓ Complete
                                                </button>
                                            )}
                                            <select value={task.status} onChange={(e) => handleStatusChange(task.id, e.target.value)} className="px-3 py-1 text-sm border-gray-300 rounded-md">
                                                <option value="pending">Pending</option>
                                                <option value="in-progress">In Progress</option>
                                                <option value="completed">Completed</option>
                                            </select>
                                            <button onClick={() => handleEditTask(task)} className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">Edit</button>
                                            <button onClick={() => deleteTask(task.id)} className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200">Delete</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {projectTasks.length === 0 && <p className="text-gray-500 p-4">No tasks for this project yet.</p>}
                        </div>
                    </InfoCard>

                    {/* Expenses */}
                    <InfoCard 
                        title="Expenses"
                        actions={<button onClick={() => setShowExpenseModal(true)} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm font-semibold">Add Expense</button>}
                    >
                         <ul className="divide-y divide-gray-200">
                            {projectExpenses.map(exp => (
                                <li key={exp._id} className="py-3 flex justify-between items-center">
                                    <p className="text-gray-800">{exp.description}</p>
                                    <p className="font-semibold">{formatINR(exp.amount)}</p>
                                    <button onClick={() => deleteExpense(exp._id)} className="text-sm text-red-600">Delete</button>
                                </li>
                            ))}
                            {projectExpenses.length === 0 && <p className="text-gray-500">No expenses for this project yet.</p>}
                        </ul>
                    </InfoCard>
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                    {/* Project Details Card */}
                    <InfoCard title="Project Details">
                        <div className="space-y-3">
                            <p><strong>Status:</strong> <span className="font-semibold text-green-600">{project.status}</span></p>
                            <p><strong>Deadline:</strong> {new Date(project.deadline).toLocaleDateString()}</p>
                        </div>
                    </InfoCard>

                    {/* Client Details Card */}
                    {client && (
                         <InfoCard title="Client Details">
                            <div className="space-y-3">
                                <p className="text-lg font-semibold">{client.name}</p>
                                <p>{client.email}</p>
                                <p>{client.phone}</p>
                                <Link to={`/clients`} className="text-blue-600 hover:underline text-sm">View all clients</Link>
                            </div>
                        </InfoCard>
                    )}
                </div>
            </div>

            {/* Task Modal */}
            {showTaskModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
                    <div className="bg-white rounded-lg p-8 w-full max-w-lg m-4">
                        <h2 className="text-xl font-bold mb-6">{editingTask ? 'Edit Task' : 'Add New Task'}</h2>
                        <form onSubmit={handleTaskSubmit} className="space-y-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Title *</label>
                                <input type="text" value={taskFormData.title} onChange={e => setTaskFormData({...taskFormData, title: e.target.value})} className="mt-1 w-full p-2 border rounded" required/>
                             </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea value={taskFormData.description} onChange={e => setTaskFormData({...taskFormData, description: e.target.value})} className="mt-1 w-full p-2 border rounded" />
                             </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Due Date</label>
                                    <input type="date" value={taskFormData.dueDate} onChange={e => setTaskFormData({...taskFormData, dueDate: e.target.value})} className="mt-1 w-full p-2 border rounded" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Priority</label>
                                    <select value={taskFormData.priority} onChange={e => setTaskFormData({...taskFormData, priority: e.target.value})} className="mt-1 w-full p-2 border rounded bg-white">
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Status</label>
                                    <select value={taskFormData.status} onChange={e => setTaskFormData({...taskFormData, status: e.target.value})} className="mt-1 w-full p-2 border rounded bg-white">
                                        <option value="pending">Pending</option>
                                        <option value="in-progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>
                            </div>
                             <div className="pt-2">
                                <label className="flex items-center space-x-3">
                                    <input type="checkbox" checked={taskFormData.isRecurring} onChange={e => setTaskFormData({...taskFormData, isRecurring: e.target.checked})} className="h-4 w-4" />
                                    <span className="text-sm font-medium text-gray-700">Is this a recurring task?</span>
                                </label>
                            </div>
                            {taskFormData.isRecurring && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md bg-gray-50">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Repeats</label>
                                        <select value={taskFormData.recurringPattern} onChange={e => setTaskFormData({...taskFormData, recurringPattern: e.target.value})} className="mt-1 w-full p-2 border rounded bg-white">
                                            <option value="daily">Daily</option>
                                            <option value="weekly">Weekly</option>
                                            <option value="monthly">Monthly</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Times</label>
                                        <input type="number" min="1" value={taskFormData.recurrenceCount} onChange={e => setTaskFormData({...taskFormData, recurrenceCount: parseInt(e.target.value, 10)})} className="mt-1 w-full p-2 border rounded" />
                                    </div>
                                </div>
                            )}
                            <div className="flex justify-end space-x-3 pt-4">
                                <button type="button" onClick={() => setShowTaskModal(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300">Cancel</button>
                                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">{editingTask ? 'Update Task' : 'Add Task'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

             {/* Expense Modal */}
             {showExpenseModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Add New Expense</h2>
                        <form onSubmit={handleExpenseSubmit}>
                            <input type="text" placeholder="Description" value={expenseFormData.description} onChange={e => setExpenseFormData({...expenseFormData, description: e.target.value})} className="w-full p-2 border rounded mb-4" required/>
                            <input type="number" placeholder="Amount" value={expenseFormData.amount} onChange={e => setExpenseFormData({...expenseFormData, amount: e.target.value})} className="w-full p-2 border rounded mb-4" required/>
                            <div className="flex justify-end space-x-3">
                                <button type="button" onClick={() => setShowExpenseModal(false)} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
                                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Add Expense</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectDetail; 