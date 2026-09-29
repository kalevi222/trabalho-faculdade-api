"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskRoutes = void 0;
const express_1 = require("express");
const task_controller_1 = require("../controllers/task.controller");
const validate_1 = require("../middlewares/validate");
const task_schema_1 = require("../schemas/task.schema");
const user_schema_1 = require("../schemas/user.schema");
const router = (0, express_1.Router)();
// GET /tasks - Listar todas
router.get('/', task_controller_1.TaskController.getAll);
// GET /tasks/:id - Buscar por id
router.get('/:id', (0, validate_1.validate)({ params: user_schema_1.idParamSchema }), task_controller_1.TaskController.getById);
// POST /tasks - Criar tarefa
router.post('/', (0, validate_1.validate)({ body: task_schema_1.createTaskSchema }), task_controller_1.TaskController.create);
// PUT /tasks/:id - Atualizar tarefa
router.put('/:id', (0, validate_1.validate)({ params: user_schema_1.idParamSchema, body: task_schema_1.updateTaskSchema }), task_controller_1.TaskController.update);
// DELETE /tasks/:id - Remover tarefa
router.delete('/:id', (0, validate_1.validate)({ params: user_schema_1.idParamSchema }), task_controller_1.TaskController.delete);
exports.taskRoutes = router;
