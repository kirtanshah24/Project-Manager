import express from 'express';
import { 
  addProject, 
  getProjects, 
  getProject, 
  updateProject, 
  deleteProject,
  toggleArchiveProject,
  getProjectStats
} from '../controllers/projectController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Project routes
router.route('/')
  .post(addProject)
  .get(getProjects);

router.route('/stats')
  .get(getProjectStats);

router.route('/:id')
  .get(getProject)
  .put(updateProject)
  .delete(deleteProject);

router.route('/:id/archive')
  .patch(toggleArchiveProject);

export default router; 