import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { validate } from '../middlewares/validate';
import { createTaskSchema, updateTaskSchema } from '../schemas/task.schema';
import { idParamSchema } from '../schemas/user.schema';

const router = Router();

// GET /tasks - Listar todas
router.get('/', TaskController.getAll);

// GET /tasks/:id - Buscar por id
router.get('/:id', validate({ params: idParamSchema }), TaskController.getById);

// POST /tasks - Criar tarefa
router.post('/', validate({ body: createTaskSchema }), TaskController.create);

// PUT /tasks/:id - Atualizar tarefa
router.put(
  '/:id',
  validate({ params: idParamSchema, body: updateTaskSchema }),
  TaskController.update
);

// DELETE /tasks/:id - Remover tarefa
router.delete('/:id', validate({ params: idParamSchema }), TaskController.delete);

export const taskRoutes = router;
