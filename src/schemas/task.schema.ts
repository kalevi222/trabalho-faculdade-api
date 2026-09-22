import { z } from 'zod';

// Schema de Criação de Tarefa
export const createTaskSchema = z.object({
  title: z
    .string({ error: 'O título da tarefa é obrigatório' })
    .min(3, { message: 'O título deve ter pelo menos 3 caracteres' })
    .max(150, { message: 'O título pode ter no máximo 150 caracteres' }),
  description: z
    .string()
    .max(1000, { message: 'A descrição pode ter no máximo 1000 caracteres' })
    .optional(),
  status: z
    .enum(['PENDING', 'IN_PROGRESS', 'COMPLETED'])
    .default('PENDING')
    .optional(),
  project_id: z
    .number({ error: 'O ID do projeto (project_id) é obrigatório' })
    .int({ message: 'O project_id deve ser um número inteiro' })
    .positive({ message: 'O project_id deve ser maior que zero' }),
  assigned_to: z
    .number()
    .int({ message: 'O assigned_to deve ser um número inteiro' })
    .positive({ message: 'O assigned_to deve ser maior que zero' })
    .optional()
    .nullable(),
});

// Schema de Atualização de Tarefa
export const updateTaskSchema = z.object({
  title: z
    .string()
    .min(3, { message: 'O título deve ter pelo menos 3 caracteres' })
    .max(150, { message: 'O título pode ter no máximo 150 caracteres' })
    .optional(),
  description: z
    .string()
    .max(1000, { message: 'A descrição pode ter no máximo 1000 caracteres' })
    .optional(),
  status: z
    .enum(['PENDING', 'IN_PROGRESS', 'COMPLETED'])
    .optional(),
  project_id: z
    .number()
    .int({ message: 'O project_id deve ser um número inteiro' })
    .positive({ message: 'O project_id deve ser maior que zero' })
    .optional(),
  assigned_to: z
    .number()
    .int({ message: 'O assigned_to deve ser um número inteiro' })
    .positive({ message: 'O assigned_to deve ser maior que zero' })
    .optional()
    .nullable(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
