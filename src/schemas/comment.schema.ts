import { z } from 'zod';

export const createCommentSchema = z.object({
  content: z
    .string({ error: 'O conteúdo do comentário é obrigatório' })
    .min(1, { message: 'O comentário não pode ser vazio' })
    .max(1000, { message: 'O comentário pode ter no máximo 1000 caracteres' }),
  task_id: z
    .number({ error: 'O ID da tarefa (task_id) é obrigatório' })
    .int({ message: 'O task_id deve ser um número inteiro' })
    .positive({ message: 'O task_id deve ser maior que zero' }),
});

export const updateCommentSchema = z.object({
  content: z
    .string({ error: 'O conteúdo do comentário é obrigatório' })
    .min(1, { message: 'O comentário não pode ser vazio' })
    .max(1000, { message: 'O comentário pode ter no máximo 1000 caracteres' }),
});

export const commentQuerySchema = z.object({
  task_id: z
    .string()
    .regex(/^\d+$/, { message: 'O task_id deve ser um número inteiro válido' })
    .optional(),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
