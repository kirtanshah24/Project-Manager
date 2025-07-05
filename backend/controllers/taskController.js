import Task from '../models/TaskModel.js';
import Project from '../models/ProjectModel.js';
import mongoose from 'mongoose';

// @desc    Add new task
// @route   POST /api/tasks
// @access  Private
export const addTask = async (req, res) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      projectId,
      isRecurring,
      recurringPattern,
      recurringInterval,
      recurringEndDate,
      recurringCount,
      tags,
      assignee,
      dependencies
    } = req.body;

    // Check if required fields are provided
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Task title is required'
      });
    }

    // Validate projectId if provided
    if (projectId && !mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID'
      });
    }

    // Validate assignee if provided
    if (assignee && !mongoose.Types.ObjectId.isValid(assignee)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid assignee ID'
      });
    }

    // Validate dependencies if provided
    if (dependencies && Array.isArray(dependencies)) {
      for (const depId of dependencies) {
        if (!mongoose.Types.ObjectId.isValid(depId)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid dependency ID'
          });
        }
      }
    }

    // Create new task
    const task = await Task.create({
      userId: req.user.id,
      title,
      description,
      status: status || 'pending',
      priority: priority || 'medium',
      dueDate: dueDate ? new Date(dueDate) : undefined,
      projectId: projectId || null,
      isRecurring: isRecurring || false,
      recurringPattern: recurringPattern || 'weekly',
      recurringInterval: recurringInterval || 1,
      recurringEndDate: recurringEndDate ? new Date(recurringEndDate) : undefined,
      recurringCount: recurringCount || 0,
      tags: tags || [],
      assignee: assignee || null,
      dependencies: dependencies || []
    });

    // Populate related data for the response
    const populatedTask = await Task.findById(task._id)
      .populate('projectId', 'name clientId')
      .populate('assignee', 'name email')
      .populate('dependencies', 'title status');

    res.status(201).json({
      success: true,
      message: 'Task added successfully',
      data: {
        task: populatedTask
      }
    });

  } catch (error) {
    console.error('Add task error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Get all tasks for user
// @route   GET /api/tasks
// @access  Private
export const getTasks = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      priority, 
      search,
      projectId,
      assignee,
      dueDate,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const query = { userId: req.user.id };
    
    // Add status filter
    if (status) {
      query.status = status;
    }
    
    // Add priority filter
    if (priority) {
      query.priority = priority;
    }

    // Add project filter
    if (projectId) {
      query.projectId = projectId;
    }

    // Add assignee filter
    if (assignee) {
      query.assignee = assignee;
    }

    // Add due date filter
    if (dueDate) {
      const filterDate = new Date(dueDate);
      query.dueDate = {
        $gte: filterDate,
        $lt: new Date(filterDate.getTime() + 24 * 60 * 60 * 1000) // Next day
      };
    }
    
    // Add search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 },
      populate: [
        {
          path: 'projectId',
          select: 'name clientId',
          populate: {
            path: 'clientId',
            select: 'name'
          }
        },
        {
          path: 'assignee',
          select: 'name email'
        },
        {
          path: 'dependencies',
          select: 'title status'
        }
      ]
    };

    const tasks = await Task.paginate(query, options);

    res.status(200).json({
      success: true,
      data: tasks
    });

  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
export const getTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user.id
    }).populate([
      {
        path: 'projectId',
        select: 'name clientId',
        populate: {
          path: 'clientId',
          select: 'name'
        }
      },
      {
        path: 'assignee',
        select: 'name email'
      },
      {
        path: 'dependencies',
        select: 'title status'
      }
    ]);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        task
      }
    });

  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req, res) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      projectId,
      isRecurring,
      recurringPattern,
      recurringInterval,
      recurringEndDate,
      recurringCount,
      tags,
      assignee,
      dependencies
    } = req.body;

    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Validate projectId if provided
    if (projectId && !mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID'
      });
    }

    // Validate assignee if provided
    if (assignee && !mongoose.Types.ObjectId.isValid(assignee)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid assignee ID'
      });
    }

    // Validate dependencies if provided
    if (dependencies && Array.isArray(dependencies)) {
      for (const depId of dependencies) {
        if (!mongoose.Types.ObjectId.isValid(depId)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid dependency ID'
          });
        }
      }
    }

    // Update task
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : task.dueDate,
        projectId: projectId || null,
        isRecurring: isRecurring !== undefined ? isRecurring : task.isRecurring,
        recurringPattern: recurringPattern || task.recurringPattern,
        recurringInterval: recurringInterval || task.recurringInterval,
        recurringEndDate: recurringEndDate ? new Date(recurringEndDate) : task.recurringEndDate,
        recurringCount: recurringCount || task.recurringCount,
        tags,
        assignee: assignee || null,
        dependencies: dependencies || []
      },
      { new: true, runValidators: true }
    ).populate([
      {
        path: 'projectId',
        select: 'name clientId',
        populate: {
          path: 'clientId',
          select: 'name'
        }
      },
      {
        path: 'assignee',
        select: 'name email'
      },
      {
        path: 'dependencies',
        select: 'title status'
      }
    ]);

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: {
        task: updatedTask
      }
    });

  } catch (error) {
    console.error('Update task error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });

  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Update task status
// @route   PATCH /api/tasks/:id/status
// @access  Private
export const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'in-progress', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate([
      {
        path: 'projectId',
        select: 'name clientId',
        populate: {
          path: 'clientId',
          select: 'name'
        }
      },
      {
        path: 'assignee',
        select: 'name email'
      }
    ]);

    res.status(200).json({
      success: true,
      message: 'Task status updated successfully',
      data: {
        task: updatedTask
      }
    });

  } catch (error) {
    console.error('Update task status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Add time entry to task
// @route   POST /api/tasks/:id/time-entry
// @access  Private
export const addTimeEntry = async (req, res) => {
  try {
    const { startTime, endTime, duration, description } = req.body;

    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const timeEntry = {
      startTime: new Date(startTime),
      endTime: endTime ? new Date(endTime) : null,
      duration: duration || 0,
      description: description || '',
      isRunning: !endTime
    };

    task.timeEntries.push(timeEntry);
    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('projectId', 'name clientId')
      .populate('assignee', 'name email');

    res.status(200).json({
      success: true,
      message: 'Time entry added successfully',
      data: {
        task: populatedTask
      }
    });

  } catch (error) {
    console.error('Add time entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Get task statistics
// @route   GET /api/tasks/stats
// @access  Private
export const getTaskStats = async (req, res) => {
  try {
    const stats = await Task.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user.id) } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
          overdue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ['$status', 'completed'] },
                    { $ne: ['$status', 'cancelled'] },
                    { $lt: ['$dueDate', new Date()] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const priorityStats = await Task.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user.id) } },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    const projectStats = await Task.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user.id) } },
      {
        $group: {
          _id: '$projectId',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: stats[0] || {
          total: 0,
          pending: 0,
          inProgress: 0,
          completed: 0,
          cancelled: 0,
          overdue: 0
        },
        priorityStats,
        projectStats
      }
    });

  } catch (error) {
    console.error('Get task stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}; 