import { Router } from 'express';
import { userRoutes } from './user.routes';
import { projectRoutes } from './project.routes';
import { taskRoutes } from './task.routes';

const routes = Router();

routes.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'API funcionando perfeitamente!' });
});

routes.use('/users', userRoutes);
routes.use('/projects', projectRoutes);
routes.use('/tasks', taskRoutes);

export default routes;
