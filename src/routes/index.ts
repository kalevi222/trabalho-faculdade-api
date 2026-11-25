import { Router } from 'express';
import { authRoutes } from './auth.routes';
import { userRoutes } from './user.routes';
import { projectRoutes } from './project.routes';
import { taskRoutes } from './task.routes';
import { commentRoutes } from './comment.routes';

const routes = Router();

routes.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'API funcionando perfeitamente!' });
});

routes.use('/auth', authRoutes);
routes.use('/users', userRoutes);
routes.use('/projects', projectRoutes);
routes.use('/tasks', taskRoutes);
routes.use('/comments', commentRoutes);

export default routes;
