import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes/index';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Rotas da API
app.use('/api', routes);

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
  console.log(`🚀 Servidor rodando com sucesso em http://localhost:${PORT}`);
  console.log(`📌 Documentação e endpoints em http://localhost:${PORT}/api/health`);
});
