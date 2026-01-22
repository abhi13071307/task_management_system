import { Router } from 'express';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskStatus,
} from '../controllers/task.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import {
  validateCreateTask,
  validateUpdateTask,
  validateQueryParams,
} from '../middlewares/task.validation';

const router = Router();

router.use(authenticateToken);

router.get('/', validateQueryParams, getTasks);
router.post('/', validateCreateTask, createTask);
router.get('/:id', getTaskById);
router.patch('/:id', validateUpdateTask, updateTask);
router.delete('/:id', deleteTask);
router.patch('/:id/toggle', toggleTaskStatus);

export default router;
