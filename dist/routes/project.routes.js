"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectRoutes = void 0;
const express_1 = require("express");
const project_controller_1 = require("../controllers/project.controller");
const validate_1 = require("../middlewares/validate");
const project_schema_1 = require("../schemas/project.schema");
const user_schema_1 = require("../schemas/user.schema");
const router = (0, express_1.Router)();
// GET /projects - Listar todos
router.get('/', project_controller_1.ProjectController.getAll);
// GET /projects/:id - Buscar por id
router.get('/:id', (0, validate_1.validate)({ params: user_schema_1.idParamSchema }), project_controller_1.ProjectController.getById);
// POST /projects - Criar projeto
router.post('/', (0, validate_1.validate)({ body: project_schema_1.createProjectSchema }), project_controller_1.ProjectController.create);
// PUT /projects/:id - Atualizar projeto
router.put('/:id', (0, validate_1.validate)({ params: user_schema_1.idParamSchema, body: project_schema_1.updateProjectSchema }), project_controller_1.ProjectController.update);
// DELETE /projects/:id - Remover projeto
router.delete('/:id', (0, validate_1.validate)({ params: user_schema_1.idParamSchema }), project_controller_1.ProjectController.delete);
exports.projectRoutes = router;
