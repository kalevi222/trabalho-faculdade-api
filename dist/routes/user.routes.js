"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const validate_1 = require("../middlewares/validate");
const user_schema_1 = require("../schemas/user.schema");
const router = (0, express_1.Router)();
// GET /users - Listar todos
router.get('/', user_controller_1.UserController.getAll);
// GET /users/:id - Buscar por id
router.get('/:id', (0, validate_1.validate)({ params: user_schema_1.idParamSchema }), user_controller_1.UserController.getById);
// POST /users - Criar usuário
router.post('/', (0, validate_1.validate)({ body: user_schema_1.createUserSchema }), user_controller_1.UserController.create);
// PUT /users/:id - Atualizar usuário
router.put('/:id', (0, validate_1.validate)({ params: user_schema_1.idParamSchema, body: user_schema_1.updateUserSchema }), user_controller_1.UserController.update);
// DELETE /users/:id - Remover usuário
router.delete('/:id', (0, validate_1.validate)({ params: user_schema_1.idParamSchema }), user_controller_1.UserController.delete);
exports.userRoutes = router;
