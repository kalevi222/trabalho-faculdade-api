import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller';
import { validate } from '../middlewares/validate';
import { createProjectSchema, updateProjectSchema } from '../schemas/project.schema';
import { idParamSchema } from '../schemas/user.schema';

const router = Router();

// GET /projects - Listar todos
router.get('/', ProjectController.getAll);

// GET /projects/:id - Buscar por id
router.get('/:id', validate({ params: idParamSchema }), ProjectController.getById);

// POST /projects - Criar projeto
router.post('/', validate({ body: createProjectSchema }), ProjectController.create);

// PUT /projects/:id - Atualizar projeto
router.put(
  '/:id',
  validate({ params: idParamSchema, body: updateProjectSchema }),
  ProjectController.update
);

// DELETE /projects/:id - Remover projeto
router.delete('/:id', validate({ params: idParamSchema }), ProjectController.delete);

export const projectRoutes = router;
