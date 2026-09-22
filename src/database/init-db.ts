import fs from 'fs';
import path from 'path';
import { pool } from '../config/db';

async function initDatabase() {
  try {
    console.log('🔄 Conectando ao PostgreSQL para criar tabelas...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    await pool.query(sql);

    console.log('✅ Tabelas criadas com sucesso no PostgreSQL!');
  } catch (error) {
    console.error('❌ Erro ao inicializar o banco de dados:', error);
  } finally {
    await pool.end();
  }
}

initDatabase();
