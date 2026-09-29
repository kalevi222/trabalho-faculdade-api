"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTaskSchema = exports.createTaskSchema = void 0;
const zod_1 = require("zod");
// Schema de Criação de Tarefa
exports.createTaskSchema = zod_1.z.object({
    title: zod_1.z
        .string({ error: 'O título da tarefa é obrigatório' })
        .min(3, { message: 'O título deve ter pelo menos 3 caracteres' })
        .max(150, { message: 'O título pode ter no máximo 150 caracteres' }),
    description: zod_1.z
        .string()
        .max(1000, { message: 'A descrição pode ter no máximo 1000 caracteres' })
        .optional(),
    status: zod_1.z
        .enum(['PENDING', 'IN_PROGRESS', 'COMPLETED'])
        .default('PENDING')
        .optional(),
    project_id: zod_1.z
        .number({ error: 'O ID do projeto (project_id) é obrigatório' })
        .int({ message: 'O project_id deve ser um número inteiro' })
        .positive({ message: 'O project_id deve ser maior que zero' }),
    assigned_to: zod_1.z
        .number()
        .int({ message: 'O assigned_to deve ser um número inteiro' })
        .positive({ message: 'O assigned_to deve ser maior que zero' })
        .optional()
        .nullable(),
});
// Schema de Atualização de Tarefa
exports.updateTaskSchema = zod_1.z.object({
    title: zod_1.z
        .string()
        .min(3, { message: 'O título deve ter pelo menos 3 caracteres' })
        .max(150, { message: 'O título pode ter no máximo 150 caracteres' })
        .optional(),
    description: zod_1.z
        .string()
        .max(1000, { message: 'A descrição pode ter no máximo 1000 caracteres' })
        .optional(),
    status: zod_1.z
        .enum(['PENDING', 'IN_PROGRESS', 'COMPLETED'])
        .optional(),
    project_id: zod_1.z
        .number()
        .int({ message: 'O project_id deve ser um número inteiro' })
        .positive({ message: 'O project_id deve ser maior que zero' })
        .optional(),
    assigned_to: zod_1.z
        .number()
        .int({ message: 'O assigned_to deve ser um número inteiro' })
        .positive({ message: 'O assigned_to deve ser maior que zero' })
        .optional()
        .nullable(),
});
