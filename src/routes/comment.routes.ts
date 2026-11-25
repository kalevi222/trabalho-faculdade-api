import { Router } from 'express';
import { CommentController } from '../controllers/comment.controller';
import { validate } from '../middlewares/validate';
import { authMiddleware } from '../middlewares/auth';
import {
  createCommentSchema,
  updateCommentSchema,
  commentQuerySchema,
} from '../schemas/comment.schema';
import { idParamSchema } from '../schemas/user.schema';

const router = Router();

router.use(authMiddleware);

router.get('/', validate({ query: commentQuerySchema }), CommentController.getAll);
router.get('/:id', validate({ params: idParamSchema }), CommentController.getById);
router.post('/', validate({ body: createCommentSchema }), CommentController.create);
router.put(
  '/:id',
  validate({ params: idParamSchema, body: updateCommentSchema }),
  CommentController.update
);
router.delete('/:id', validate({ params: idParamSchema }), CommentController.delete);

export const commentRoutes = router;
