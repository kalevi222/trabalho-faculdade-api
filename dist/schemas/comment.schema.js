"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentQuerySchema = exports.updateCommentSchema = exports.createCommentSchema = void 0;
const zod_1 = require("zod");
exports.createCommentSchema = zod_1.z.object({
    content: zod_1.z
        .string({ error: 'O conteúdo do comentário é obrigatório' })
        .min(1, { message: 'O comentário não pode ser vazio' })
        .max(1000, { message: 'O comentário pode ter no máximo 1000 caracteres' }),
    task_id: zod_1.z
        .number({ error: 'O ID da tarefa (task_id) é obrigatório' })
        .int({ message: 'O task_id deve ser um número inteiro' })
        .positive({ message: 'O task_id deve ser maior que zero' }),
});
exports.updateCommentSchema = zod_1.z.object({
    content: zod_1.z
        .string({ error: 'O conteúdo do comentário é obrigatório' })
        .min(1, { message: 'O comentário não pode ser vazio' })
        .max(1000, { message: 'O comentário pode ter no máximo 1000 caracteres' }),
});
exports.commentQuerySchema = zod_1.z.object({
    task_id: zod_1.z
        .string()
        .regex(/^\d+$/, { message: 'O task_id deve ser um número inteiro válido' })
        .optional(),
});
