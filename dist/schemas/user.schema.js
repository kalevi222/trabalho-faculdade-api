"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserSchema = exports.createUserSchema = exports.idParamSchema = void 0;
const zod_1 = require("zod");
// Validação de parâmetro de rota com ID numérico
exports.idParamSchema = zod_1.z.object({
    id: zod_1.z.string().regex(/^\d+$/, { message: 'O ID deve ser um número inteiro válido' }),
});
// Schema de Criação de Usuário (apenas ADMIN)
exports.createUserSchema = zod_1.z.object({
    name: zod_1.z
        .string({ error: 'O nome é obrigatório' })
        .min(3, { message: 'O nome deve ter pelo menos 3 caracteres' })
        .max(100, { message: 'O nome pode ter no máximo 100 caracteres' }),
    email: zod_1.z
        .string({ error: 'O e-mail é obrigatório' })
        .email({ message: 'Formato de e-mail inválido' }),
    password: zod_1.z
        .string({ error: 'A senha é obrigatória' })
        .min(6, { message: 'A senha deve ter pelo menos 6 caracteres' })
        .max(100, { message: 'A senha pode ter no máximo 100 caracteres' }),
    role: zod_1.z
        .enum(['ADMIN', 'MEMBER'], { message: 'O papel deve ser ADMIN ou MEMBER' })
        .optional(),
});
// Schema de Atualização de Usuário (todos os campos opcionais)
exports.updateUserSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(3, { message: 'O nome deve ter pelo menos 3 caracteres' })
        .max(100, { message: 'O nome pode ter no máximo 100 caracteres' })
        .optional(),
    email: zod_1.z
        .string()
        .email({ message: 'Formato de e-mail inválido' })
        .optional(),
    password: zod_1.z
        .string()
        .min(6, { message: 'A senha deve ter pelo menos 6 caracteres' })
        .max(100, { message: 'A senha pode ter no máximo 100 caracteres' })
        .optional(),
    role: zod_1.z
        .enum(['ADMIN', 'MEMBER'], { message: 'O papel deve ser ADMIN ou MEMBER' })
        .optional(),
});
