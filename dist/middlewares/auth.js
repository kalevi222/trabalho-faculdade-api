"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.authMiddleware = exports.getJwtSecret = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const getJwtSecret = () => {
    return process.env.JWT_SECRET || 'faculdade_dev_jwt_secret_2026';
};
exports.getJwtSecret = getJwtSecret;
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token de autenticação não fornecido' });
    }
    const token = authHeader.slice(7).trim();
    if (!token) {
        return res.status(401).json({ message: 'Token de autenticação inválido' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, (0, exports.getJwtSecret)());
        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
        };
        return next();
    }
    catch {
        return res.status(401).json({ message: 'Token inválido ou expirado' });
    }
};
exports.authMiddleware = authMiddleware;
const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Usuário não autenticado' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Você não tem permissão para realizar esta ação' });
        }
        return next();
    };
};
exports.requireRole = requireRole;
