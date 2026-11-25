import { z } from 'zod';

export const registerSchema = z.object({
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
});

export const loginSchema = z.object({
  email: z
    .string({ error: 'O e-mail é obrigatório' })
    .email({ message: 'Formato de e-mail inválido' }),
  password: z
    .string({ error: 'A senha é obrigatória' })
    .min(1, { message: 'A senha é obrigatória' }),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
