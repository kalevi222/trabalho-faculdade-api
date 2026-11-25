"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../config/db");
const auth_1 = require("../middlewares/auth");
const signUserToken = (user) => {
    const expiresIn = (process.env.JWT_EXPIRES_IN || '1d');
    return jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, (0, auth_1.getJwtSecret)(), { expiresIn });
};
class AuthController {
    static async register(req, res) {
        try {
            const { name, email, password } = req.body;
            const existing = await (0, db_1.query)('SELECT id FROM users WHERE email = $1', [email]);
            if (existing.rows.length > 0) {
                return res.status(409).json({ message: 'Já existe um usuário cadastrado com este e-mail' });
            }
            const passwordHash = await bcryptjs_1.default.hash(password, 10);
            const result = await (0, db_1.query)(`INSERT INTO users (name, email, password_hash, role)
         VALUES ($1, $2, $3, 'MEMBER')
         RETURNING id, name, email, role, created_at`, [name, email, passwordHash]);
            const user = result.rows[0];
            const token = signUserToken(user);
            return res.status(201).json({ user, token });
        }
        catch (error) {
            console.error('Erro ao registrar usuário:', error);
            return res.status(500).json({ message: 'Erro ao registrar usuário' });
        }
    }
    static async login(req, res) {
        try {
            const { email, password } = req.body;
            const result = await (0, db_1.query)('SELECT id, name, email, password_hash, role, created_at FROM users WHERE email = $1', [email]);
            if (result.rows.length === 0) {
                return res.status(401).json({ message: 'E-mail ou senha inválidos' });
            }
            const userRow = result.rows[0];
            const passwordMatch = userRow.password_hash
                ? await bcryptjs_1.default.compare(password, userRow.password_hash)
                : false;
            if (!passwordMatch) {
                return res.status(401).json({ message: 'E-mail ou senha inválidos' });
            }
            const user = {
                id: userRow.id,
                name: userRow.name,
                email: userRow.email,
                role: userRow.role,
                created_at: userRow.created_at,
            };
            const token = signUserToken(user);
            return res.status(200).json({ user, token });
        }
        catch (error) {
            console.error('Erro ao autenticar usuário:', error);
            return res.status(500).json({ message: 'Erro ao realizar login' });
        }
    }
    static async me(req, res) {
        try {
            const userId = req.user?.id;
            const result = await (0, db_1.query)('SELECT id, name, email, role, created_at FROM users WHERE id = $1', [userId]);
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Usuário não encontrado' });
            }
            return res.status(200).json(result.rows[0]);
        }
        catch (error) {
            console.error('Erro ao buscar perfil:', error);
            return res.status(500).json({ message: 'Erro ao buscar dados do usuário autenticado' });
        }
    }
}
exports.AuthController = AuthController;
