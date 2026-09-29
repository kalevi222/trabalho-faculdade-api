"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProjectSchema = exports.createProjectSchema = void 0;
const zod_1 = require("zod");
// Schema de Criação de Projeto
exports.createProjectSchema = zod_1.z.object({
    title: zod_1.z
        .string({ error: 'O título do projeto é obrigatório' })
        .min(3, { message: 'O título deve ter pelo menos 3 caracteres' })
        .max(150, { message: 'O título pode ter no máximo 150 caracteres' }),
    description: zod_1.z
        .string()
        .max(1000, { message: 'A descrição pode ter no máximo 1000 caracteres' })
        .optional(),
    owner_id: zod_1.z
        .number({ error: 'O ID do proprietário (owner_id) é obrigatório' })
        .int({ message: 'O owner_id deve ser um número inteiro' })
        .positive({ message: 'O owner_id deve ser maior que zero' }),
});
// Schema de Atualização de Projeto
exports.updateProjectSchema = zod_1.z.object({
    title: zod_1.z
        .string()
        .min(3, { message: 'O título deve ter pelo menos 3 caracteres' })
        .max(150, { message: 'O título pode ter no máximo 150 caracteres' })
        .optional(),
    description: zod_1.z
        .string()
        .max(1000, { message: 'A descrição pode ter no máximo 1000 caracteres' })
        .optional(),
    owner_id: zod_1.z
        .number()
        .int({ message: 'O owner_id deve ser um número inteiro' })
        .positive({ message: 'O owner_id deve ser maior que zero' })
        .optional(),
});
