import express from 'express';
import { 
  addTask, 
  getTasks, 
  getTask, 
  updateTask, 
  deleteTask,
  updateTaskStatus,
  addTimeEntry,
  getTaskStats
} from '../controllers/taskController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Task routes
router.route('/')
  .post(addTask)
  .get(getTasks);

router.route('/stats')
  .get(getTaskStats);

router.route('/:id')
  .get(getTask)
  .put(updateTask)
  .delete(deleteTask);

router.route('/:id/status')
  .patch(updateTaskStatus);

router.route('/:id/time-entry')
  .post(addTimeEntry);

export default router; 