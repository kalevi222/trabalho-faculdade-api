"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserSchema = exports.createUserSchema = exports.idParamSchema = void 0;
const zod_1 = require("zod");
// Validação de parâmetro de rota com ID numérico
exports.idParamSchema = zod_1.z.object({
    id: zod_1.z.string().regex(/^\d+$/, { message: 'O ID deve ser um número inteiro válido' }),
});
// Schema de Criação de Usuário
exports.createUserSchema = zod_1.z.object({
    name: zod_1.z
        .string({ error: 'O nome é obrigatório' })
        .min(3, { message: 'O nome deve ter pelo menos 3 caracteres' })
        .max(100, { message: 'O nome pode ter no máximo 100 caracteres' }),
    email: zod_1.z
        .string({ error: 'O e-mail é obrigatório' })
        .email({ message: 'Formato de e-mail inválido' }),
    role: zod_1.z
        .string()
        .max(50, { message: 'O papel (role) pode ter no máximo 50 caracteres' })
        .optional(),
});
// Schema de Atualização de Usuário (todos os campos opcionais)
exports.updateUserSchema = exports.createUserSchema.partial();
