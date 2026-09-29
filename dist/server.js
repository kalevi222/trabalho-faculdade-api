"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const index_1 = __importDefault(require("./routes/index"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Rotas da API
app.use('/api', index_1.default);
// Rota raiz
app.get('/', (req, res) => {
    res.json({
        message: 'Bem-vindo à API de Gestão de Tarefas!',
        endpoints: {
            health: 'GET /api/health',
            users: '/api/users',
            projects: '/api/projects',
            tasks: '/api/tasks',
        },
        documentation: 'Consulte o arquivo README.md para a lista completa de rotas e exemplos.',
    });
});
app.listen(PORT, () => {
    console.log(`Servidor rodando com sucesso em http://localhost:${PORT}`);
    console.log(`Endpoints em http://localhost:${PORT}/api/health`);
});
