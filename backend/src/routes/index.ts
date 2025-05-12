import { Router } from 'express';
import { userRoutes } from './user.routes';
import { taskRoutes } from './task.routes';

const router = Router();

router.use('/auth', userRoutes);
router.use('/tasks', taskRoutes);

export default router;