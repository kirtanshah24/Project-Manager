import Project from '../models/ProjectModel.js';
import mongoose from 'mongoose';

// @desc    Add new project
// @route   POST /api/projects
// @access  Private
export const addProject = async (req, res) => {
  try {
    const {
      name,
      description,
      status,
      priority,
      startDate,
      endDate,
      deadline,
      budget,
      tags,
      notes,
      clientId
    } = req.body;

    // Check if required fields are provided
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Project name is required'
      });
    }

    // Validate clientId if provided
    if (clientId && !mongoose.Types.ObjectId.isValid(clientId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid client ID'
      });
    }

    // Create new project
    const project = await Project.create({
      userId: req.user.id,
      name,
      description,
      status: status || 'active',
      priority: priority || 'medium',
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      deadline: deadline ? new Date(deadline) : undefined,
      budget,
      tags: tags || [],
      notes,
      clientId: clientId || null
    });

    // Populate client data for the response
    const populatedProject = await Project.findById(project._id).populate('clientId', 'name email company');

    res.status(201).json({
      success: true,
      message: 'Project added successfully',
      data: {
        project: populatedProject
      }
    });

  } catch (error) {
    console.error('Add project error:', error);
    
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

// @desc    Get all projects for user
// @route   GET /api/projects
// @access  Private
export const getProjects = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      priority, 
      search,
      clientId,
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

    // Add client filter
    if (clientId) {
      query.clientId = clientId;
    }
    
    // Add search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 },
      populate: {
        path: 'clientId',
        select: 'name email company'
      }
    };

    const projects = await Project.paginate(query, options);

    res.status(200).json({
      success: true,
      data: projects
    });

  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
export const getProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      userId: req.user.id
    }).populate('clientId', 'name email company');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        project
      }
    });

  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
export const updateProject = async (req, res) => {
  try {
    const {
      name,
      description,
      status,
      priority,
      startDate,
      endDate,
      deadline,
      budget,
      tags,
      notes,
      clientId
    } = req.body;

    const project = await Project.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Validate clientId if provided
    if (clientId && !mongoose.Types.ObjectId.isValid(clientId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid client ID'
      });
    }

    // Update project
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        status,
        priority,
        startDate: startDate ? new Date(startDate) : project.startDate,
        endDate: endDate ? new Date(endDate) : project.endDate,
        deadline: deadline ? new Date(deadline) : project.deadline,
        budget,
        tags,
        notes,
        clientId: clientId || null
      },
      { new: true, runValidators: true }
    ).populate('clientId', 'name email company');

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: {
        project: updatedProject
      }
    });

  } catch (error) {
    console.error('Update project error:', error);
    
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

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    await Project.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    });

  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Archive/Unarchive project
// @route   PATCH /api/projects/:id/archive
// @access  Private
export const toggleArchiveProject = async (req, res) => {
  try {
    const { isArchived } = req.body;

    const project = await Project.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      { isArchived: isArchived },
      { new: true, runValidators: true }
    ).populate('clientId', 'name email company');

    res.status(200).json({
      success: true,
      message: `Project ${isArchived ? 'archived' : 'unarchived'} successfully`,
      data: {
        project: updatedProject
      }
    });

  } catch (error) {
    console.error('Toggle archive project error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Get project statistics
// @route   GET /api/projects/stats
// @access  Private
export const getProjectStats = async (req, res) => {
  try {
    const stats = await Project.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user.id) } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          onHold: { $sum: { $cond: [{ $eq: ['$status', 'on-hold'] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
          archived: { $sum: { $cond: ['$isArchived', 1, 0] } },
          totalBudget: { $sum: { $ifNull: ['$budget', 0] } }
        }
      }
    ]);

    const statusStats = await Project.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user.id) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const priorityStats = await Project.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user.id) } },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: stats[0] || {
          total: 0,
          active: 0,
          completed: 0,
          onHold: 0,
          cancelled: 0,
          archived: 0,
          totalBudget: 0
        },
        statusStats,
        priorityStats
      }
    });

  } catch (error) {
    console.error('Get project stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}; 