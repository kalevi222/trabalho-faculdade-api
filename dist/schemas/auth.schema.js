"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
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
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z
        .string({ error: 'O e-mail é obrigatório' })
        .email({ message: 'Formato de e-mail inválido' }),
    password: zod_1.z
        .string({ error: 'A senha é obrigatória' })
        .min(1, { message: 'A senha é obrigatória' }),
});
