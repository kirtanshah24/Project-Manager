import Expense from '../models/ExpenseModel.js';
import Project from '../models/ProjectModel.js';
import Task from '../models/TaskModel.js';

// Get all expenses with filtering and pagination
export const getExpenses = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      projectId,
      taskId,
      category,
      startDate,
      endDate,
      search,
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;

    const userId = req.user.id;
    const query = { userId };

    // Add filters
    if (projectId) query.projectId = projectId;
    if (taskId) query.taskId = taskId;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // Get expenses with population
    const expenses = await Expense.find(query)
      .populate('projectId', 'name clientId')
      .populate('taskId', 'title')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Expense.countDocuments(query);

    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: {
        docs: expenses,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages,
        totalDocs: total
      }
    });
  } catch (error) {
    console.error('Error getting expenses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get expenses'
    });
  }
};

// Get expense by ID
export const getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const expense = await Expense.findOne({ _id: id, userId })
      .populate('projectId', 'name clientId')
      .populate('taskId', 'title');

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    res.json({
      success: true,
      data: { expense }
    });
  } catch (error) {
    console.error('Error getting expense:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get expense'
    });
  }
};

// Add new expense
export const addExpense = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      projectId,
      taskId,
      description,
      amount,
      date,
      category,
      isReimbursable,
      notes,
      tags
    } = req.body;

    // Validate required fields
    if (!projectId || !description || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Project ID, description, and amount are required'
      });
    }

    // Verify project exists and belongs to user
    const project = await Project.findOne({ _id: projectId, userId });
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Verify task exists and belongs to project (if taskId provided)
    if (taskId) {
      const task = await Task.findOne({ _id: taskId, projectId });
      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found or does not belong to the specified project'
        });
      }
    }

    const expenseData = {
      userId,
      projectId,
      description,
      amount: parseFloat(amount),
      date: date || new Date(),
      category: category || 'other',
      isReimbursable: isReimbursable || false,
      notes,
      tags: tags || []
    };

    if (taskId) {
      expenseData.taskId = taskId;
    }

    const expense = new Expense(expenseData);
    await expense.save();

    // Populate project and task info
    await expense.populate('projectId', 'name clientId');
    if (taskId) {
      await expense.populate('taskId', 'title');
    }

    res.status(201).json({
      success: true,
      message: 'Expense added successfully',
      data: { expense }
    });
  } catch (error) {
    console.error('Error adding expense:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add expense'
    });
  }
};

// Update expense
export const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    // Check if expense exists and belongs to user
    const existingExpense = await Expense.findOne({ _id: id, userId });
    if (!existingExpense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    // Validate project if projectId is being updated
    if (updateData.projectId) {
      const project = await Project.findOne({ _id: updateData.projectId, userId });
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }
    }

    // Validate task if taskId is being updated
    if (updateData.taskId) {
      const task = await Task.findOne({ 
        _id: updateData.taskId, 
        projectId: updateData.projectId || existingExpense.projectId 
      });
      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found or does not belong to the specified project'
        });
      }
    }

    // Convert amount to number if provided
    if (updateData.amount) {
      updateData.amount = parseFloat(updateData.amount);
    }

    const expense = await Expense.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('projectId', 'name clientId')
     .populate('taskId', 'title');

    res.json({
      success: true,
      message: 'Expense updated successfully',
      data: { expense }
    });
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update expense'
    });
  }
};

// Delete expense
export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const expense = await Expense.findOneAndDelete({ _id: id, userId });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    res.json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete expense'
    });
  }
};

// Get expense statistics
export const getExpenseStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { projectId, startDate, endDate } = req.query;

    const query = { userId };
    if (projectId) query.projectId = projectId;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Get total expenses
    const totalExpenses = await Expense.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Get expenses by category
    const expensesByCategory = await Expense.aggregate([
      { $match: query },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ]);

    // Get expenses by project
    const expensesByProject = await Expense.aggregate([
      { $match: query },
      { $lookup: { from: 'projects', localField: 'projectId', foreignField: '_id', as: 'project' } },
      { $unwind: '$project' },
      { $group: { _id: '$projectId', projectName: { $first: '$project.name' }, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ]);

    // Get monthly expenses for current year
    const currentYear = new Date().getFullYear();
    const monthlyExpenses = await Expense.aggregate([
      { 
        $match: { 
          ...query, 
          date: { 
            $gte: new Date(currentYear, 0, 1), 
            $lt: new Date(currentYear + 1, 0, 1) 
          } 
        } 
      },
      { 
        $group: { 
          _id: { $month: '$date' }, 
          total: { $sum: '$amount' } 
        } 
      },
      { $sort: { _id: 1 } }
    ]);

    // Get reimbursable expenses
    const reimbursableExpenses = await Expense.aggregate([
      { $match: { ...query, isReimbursable: true } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    const stats = {
      totalAmount: totalExpenses[0]?.total || 0,
      totalCount: await Expense.countDocuments(query),
      byCategory: expensesByCategory,
      byProject: expensesByProject,
      monthly: monthlyExpenses,
      reimbursable: {
        total: reimbursableExpenses[0]?.total || 0,
        count: reimbursableExpenses[0]?.count || 0
      }
    };

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('Error getting expense stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get expense statistics'
    });
  }
};

// Update expense reimbursement status
export const updateExpenseReimbursement = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { isReimbursed, reimbursedDate } = req.body;

    const expense = await Expense.findOneAndUpdate(
      { _id: id, userId },
      { 
        isReimbursed, 
        reimbursedDate: isReimbursed ? (reimbursedDate || new Date()) : null 
      },
      { new: true }
    ).populate('projectId', 'name clientId')
     .populate('taskId', 'title');

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    res.json({
      success: true,
      message: 'Expense reimbursement status updated',
      data: { expense }
    });
  } catch (error) {
    console.error('Error updating expense reimbursement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update expense reimbursement status'
    });
  }
}; 