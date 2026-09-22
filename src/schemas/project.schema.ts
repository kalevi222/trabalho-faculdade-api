import { z } from 'zod';

// Schema de Criação de Projeto
export const createProjectSchema = z.object({
  title: z
    .string({ error: 'O título do projeto é obrigatório' })
    .min(3, { message: 'O título deve ter pelo menos 3 caracteres' })
    .max(150, { message: 'O título pode ter no máximo 150 caracteres' }),
  description: z
    .string()
    .max(1000, { message: 'A descrição pode ter no máximo 1000 caracteres' })
    .optional(),
  owner_id: z
    .number({ error: 'O ID do proprietário (owner_id) é obrigatório' })
    .int({ message: 'O owner_id deve ser um número inteiro' })
    .positive({ message: 'O owner_id deve ser maior que zero' }),
});

// Schema de Atualização de Projeto
export const updateProjectSchema = z.object({
  title: z
    .string()
    .min(3, { message: 'O título deve ter pelo menos 3 caracteres' })
    .max(150, { message: 'O título pode ter no máximo 150 caracteres' })
    .optional(),
  description: z
    .string()
    .max(1000, { message: 'A descrição pode ter no máximo 1000 caracteres' })
    .optional(),
  owner_id: z
    .number()
    .int({ message: 'O owner_id deve ser um número inteiro' })
    .positive({ message: 'O owner_id deve ser maior que zero' })
    .optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
