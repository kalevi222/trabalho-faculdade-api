"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const db_1 = require("../config/db");
async function initDatabase() {
    try {
        console.log('🔄 Conectando ao PostgreSQL para criar tabelas...');
        const schemaPath = path_1.default.join(__dirname, 'schema.sql');
        const sql = fs_1.default.readFileSync(schemaPath, 'utf8');
        await db_1.pool.query(sql);
        console.log('✅ Tabelas criadas com sucesso no PostgreSQL!');
    }
    catch (error) {
        console.error('❌ Erro ao inicializar o banco de dados:', error);
    }
    finally {
        await db_1.pool.end();
    }
}
initDatabase();
