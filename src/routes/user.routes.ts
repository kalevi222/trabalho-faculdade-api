import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { validate } from '../middlewares/validate';
import { authMiddleware, requireRole } from '../middlewares/auth';
import { createUserSchema, updateUserSchema, idParamSchema } from '../schemas/user.schema';

const router = Router();

router.use(authMiddleware);

// GET /users - Listar todos
router.get('/', UserController.getAll);

// GET /users/:id - Buscar por id
router.get('/:id', validate({ params: idParamSchema }), UserController.getById);

// POST /users - Criar usuário (apenas ADMIN)
router.post('/', requireRole('ADMIN'), validate({ body: createUserSchema }), UserController.create);

// PUT /users/:id - Atualizar usuário (apenas o próprio)
router.put(
  '/:id',
  validate({ params: idParamSchema, body: updateUserSchema }),
  UserController.update
);

// DELETE /users/:id - Remover usuário (apenas ADMIN)
router.delete(
  '/:id',
  requireRole('ADMIN'),
  validate({ params: idParamSchema }),
  UserController.delete
);

export const userRoutes = router;
