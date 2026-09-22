import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { validate } from '../middlewares/validate';
import { createUserSchema, updateUserSchema, idParamSchema } from '../schemas/user.schema';

const router = Router();

// GET /users - Listar todos
router.get('/', UserController.getAll);

// GET /users/:id - Buscar por id
router.get('/:id', validate({ params: idParamSchema }), UserController.getById);

// POST /users - Criar usuário
router.post('/', validate({ body: createUserSchema }), UserController.create);

// PUT /users/:id - Atualizar usuário
router.put(
  '/:id',
  validate({ params: idParamSchema, body: updateUserSchema }),
  UserController.update
);

// DELETE /users/:id - Remover usuário
router.delete('/:id', validate({ params: idParamSchema }), UserController.delete);

export const userRoutes = router;
