"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_routes_1 = require("./user.routes");
const project_routes_1 = require("./project.routes");
const task_routes_1 = require("./task.routes");
const routes = (0, express_1.Router)();
routes.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'API funcionando perfeitamente!' });
});
routes.use('/users', user_routes_1.userRoutes);
routes.use('/projects', project_routes_1.projectRoutes);
routes.use('/tasks', task_routes_1.taskRoutes);
exports.default = routes;
