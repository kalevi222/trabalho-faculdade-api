import { z } from 'zod';

// Validação de parâmetro de rota com ID numérico
export const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, { message: 'O ID deve ser um número inteiro válido' }),
});

// Schema de Criação de Usuário (apenas ADMIN)
export const createUserSchema = z.object({
  name: z
    .string({ error: 'O nome é obrigatório' })
    .min(3, { message: 'O nome deve ter pelo menos 3 caracteres' })
    .max(100, { message: 'O nome pode ter no máximo 100 caracteres' }),
  email: z
    .string({ error: 'O e-mail é obrigatório' })
    .email({ message: 'Formato de e-mail inválido' }),
  password: z
    .string({ error: 'A senha é obrigatória' })
    .min(6, { message: 'A senha deve ter pelo menos 6 caracteres' })
    .max(100, { message: 'A senha pode ter no máximo 100 caracteres' }),
  role: z
    .enum(['ADMIN', 'MEMBER'], { message: 'O papel deve ser ADMIN ou MEMBER' })
    .optional(),
});

// Schema de Atualização de Usuário (todos os campos opcionais)
export const updateUserSchema = z.object({
  name: z
    .string()
    .min(3, { message: 'O nome deve ter pelo menos 3 caracteres' })
    .max(100, { message: 'O nome pode ter no máximo 100 caracteres' })
    .optional(),
  email: z
    .string()
    .email({ message: 'Formato de e-mail inválido' })
    .optional(),
  password: z
    .string()
    .min(6, { message: 'A senha deve ter pelo menos 6 caracteres' })
    .max(100, { message: 'A senha pode ter no máximo 100 caracteres' })
    .optional(),
  role: z
    .enum(['ADMIN', 'MEMBER'], { message: 'O papel deve ser ADMIN ou MEMBER' })
    .optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
