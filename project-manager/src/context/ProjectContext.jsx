import React, { createContext, useContext, useState, useEffect } from 'react'
import { toast } from 'react-toastify'

const ProjectContext = createContext()

export const useProjects = () => {
  const context = useContext(ProjectContext)
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider')
  }
  return context
}

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])

  useEffect(() => {
    // Load data from localStorage
    const storedProjects = localStorage.getItem('freelancer_projects')
    const storedTasks = localStorage.getItem('freelancer_tasks')

    if (storedProjects) setProjects(JSON.parse(storedProjects))
    if (storedTasks) setTasks(JSON.parse(storedTasks))
  }, [])

  useEffect(() => {
    // Save to localStorage whenever data changes
    localStorage.setItem('freelancer_projects', JSON.stringify(projects))
  }, [projects])

  useEffect(() => {
    localStorage.setItem('freelancer_tasks', JSON.stringify(tasks))
  }, [tasks])

  // Project CRUD operations
  const addProject = (project) => {
    const newProject = {
      ...project,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: 'active'
    }
    setProjects(prev => [...prev, newProject])
    toast.success('Project created successfully!')
  }

  const updateProject = (id, updates) => {
    setProjects(prev => prev.map(project => 
      project.id === id ? { ...project, ...updates } : project
    ))
    toast.success('Project updated successfully!')
  }

  const deleteProject = (id) => {
    setProjects(prev => prev.filter(project => project.id !== id))
    // Also delete associated tasks
    setTasks(prev => prev.filter(task => task.projectId !== id))
    toast.success('Project deleted successfully!')
  }

  // Task CRUD operations
  const addTask = (task) => {
    if (task.isRecurring && task.recurrenceCount > 1) {
      const newTasks = [];
      const recurrenceId = `recur-${Date.now()}`;
      let lastDueDate = task.dueDate ? new Date(task.dueDate) : new Date();

      for (let i = 0; i < task.recurrenceCount; i++) {
        if (i > 0) { // Calculate next due date for subsequent tasks
          switch (task.recurringPattern) {
            case 'daily':
              lastDueDate.setDate(lastDueDate.getDate() + 1);
              break;
            case 'weekly':
              lastDueDate.setDate(lastDueDate.getDate() + 7);
              break;
            case 'monthly':
              lastDueDate.setMonth(lastDueDate.getMonth() + 1);
              break;
            default:
              break;
          }
        }
        
        const instanceTask = {
          ...task,
          id: `${recurrenceId}-${i + 1}`,
          createdAt: new Date().toISOString(),
          status: 'pending',
          timeSpent: 0,
          recurrenceId,
          instanceNumber: i + 1,
          isVisible: i === 0, // Only the first task is visible initially
          dueDate: task.dueDate ? new Date(lastDueDate).toISOString().split('T')[0] : null,
          title: `${task.title} (${i + 1}/${task.recurrenceCount})`
        };
        newTasks.push(instanceTask);
      }
      setTasks(prev => [...prev, ...newTasks]);
      toast.success(`${task.recurrenceCount} recurring tasks created!`);

    } else {
      const newTask = {
        ...task,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        status: 'pending',
        isVisible: true,
      }
      setTasks(prev => [...prev, newTask])
      toast.success('Task created successfully!')
    }
  }

  const updateTask = (id, updates) => {
    let nextTaskToShow = null;

    setTasks(prev => prev.map(task => {
        if (task.id === id) {
          // If task is being completed and is part of a recurring series
          if (updates.status === 'completed' && task.recurrenceId) {
            const currentInstance = task.instanceNumber;
            const nextInstance = currentInstance + 1;
            const nextTaskId = `${task.recurrenceId}-${nextInstance}`;
            
            // Find the next task in the series to make it visible
            nextTaskToShow = prev.find(t => t.id === nextTaskId);
          }
          return { ...task, ...updates };
        }
        return task;
      })
    );
    
    // Make the next task visible
    if (nextTaskToShow) {
      setTasks(prev => prev.map(task => 
        task.id === nextTaskToShow.id ? { ...task, isVisible: true } : task
      ));
    }

    toast.success('Task updated successfully!')
  }

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(task => task.id !== id))
    toast.success('Task deleted successfully!')
  }

  const getProjectTasks = (projectId) => {
    return tasks.filter(task => task.projectId === projectId)
  }

  const value = {
    projects,
    tasks,
    addProject,
    updateProject,
    deleteProject,
    addTask,
    updateTask,
    deleteTask,
    getProjectTasks,
  }

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  )
} 