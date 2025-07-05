import express from 'express';
import { 
  addClient, 
  getClients, 
  getClient, 
  updateClient, 
  deleteClient 
} from '../controllers/clientController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Client routes
router.route('/')
  .post(addClient)
  .get(getClients);

router.route('/:id')
  .get(getClient)
  .put(updateClient)
  .delete(deleteClient);

export default router; 