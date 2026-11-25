import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Formato de e-mail inválido'),
  password: z.string().min(1, 'A senha é obrigatória'),
});

export const registerSchema = z.object({
  name: z
    .string()
    .min(3, 'O nome deve ter pelo menos 3 caracteres')
    .max(100, 'O nome pode ter no máximo 100 caracteres'),
  email: z.string().email('Formato de e-mail inválido'),
  password: z
    .string()
    .min(6, 'A senha deve ter pelo menos 6 caracteres')
    .max(100, 'A senha pode ter no máximo 100 caracteres'),
});

export const projectSchema = z.object({
  title: z
    .string()
    .min(3, 'O título deve ter pelo menos 3 caracteres')
    .max(150, 'O título pode ter no máximo 150 caracteres'),
  description: z
    .string()
    .max(1000, 'A descrição pode ter no máximo 1000 caracteres')
    .optional(),
  owner_id: z.number().int().positive('Selecione um proprietário válido'),
});

export const taskSchema = z.object({
  title: z
    .string()
    .min(3, 'O título deve ter pelo menos 3 caracteres')
    .max(150, 'O título pode ter no máximo 150 caracteres'),
  description: z
    .string()
    .max(1000, 'A descrição pode ter no máximo 1000 caracteres')
    .optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']),
  project_id: z.number().int().positive('Selecione um projeto'),
  assigned_to: z.number().int().positive().nullable().optional(),
});

export const commentSchema = z.object({
  content: z
    .string()
    .min(1, 'O comentário não pode ser vazio')
    .max(1000, 'O comentário pode ter no máximo 1000 caracteres'),
  task_id: z.number().int().positive('Tarefa inválida'),
});

export const adminCreateUserSchema = z.object({
  name: z
    .string()
    .min(3, 'O nome deve ter pelo menos 3 caracteres')
    .max(100, 'O nome pode ter no máximo 100 caracteres'),
  email: z.string().email('Formato de e-mail inválido'),
  password: z
    .string()
    .min(6, 'A senha deve ter pelo menos 6 caracteres')
    .max(100, 'A senha pode ter no máximo 100 caracteres'),
  role: z.enum(['ADMIN', 'MEMBER']),
});

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(3, 'O nome deve ter pelo menos 3 caracteres')
    .max(100, 'O nome pode ter no máximo 100 caracteres'),
  email: z.string().email('Formato de e-mail inválido'),
  password: z
    .string()
    .min(6, 'A senha deve ter pelo menos 6 caracteres')
    .max(100, 'A senha pode ter no máximo 100 caracteres')
    .optional()
    .or(z.literal('')),
});

export function getFirstZodError(error: z.ZodError): string {
  return error.issues[0]?.message || 'Dados inválidos';
}
