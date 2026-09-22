import { z } from 'zod';

// Validação de parâmetro de rota com ID numérico
export const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, { message: 'O ID deve ser um número inteiro válido' }),
});

// Schema de Criação de Usuário
export const createUserSchema = z.object({
  name: z
    .string({ error: 'O nome é obrigatório' })
    .min(3, { message: 'O nome deve ter pelo menos 3 caracteres' })
    .max(100, { message: 'O nome pode ter no máximo 100 caracteres' }),
  email: z
    .string({ error: 'O e-mail é obrigatório' })
    .email({ message: 'Formato de e-mail inválido' }),
  role: z
    .string()
    .max(50, { message: 'O papel (role) pode ter no máximo 50 caracteres' })
    .optional(),
});

// Schema de Atualização de Usuário (todos os campos opcionais)
export const updateUserSchema = createUserSchema.partial();

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
