import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { query } from '../config/db';
import { getJwtSecret } from '../middlewares/auth';

const signUserToken = (user: { id: number; email: string; role: string }) => {
  const expiresIn = (process.env.JWT_EXPIRES_IN || '1d') as SignOptions['expiresIn'];
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    getJwtSecret(),
    { expiresIn }
  );
};

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body;

      const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
      if (existing.rows.length > 0) {
        return res.status(409).json({ message: 'Já existe um usuário cadastrado com este e-mail' });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const result = await query(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES ($1, $2, $3, 'MEMBER')
         RETURNING id, name, email, role, created_at`,
        [name, email, passwordHash]
      );

      const user = result.rows[0];
      const token = signUserToken(user);

      return res.status(201).json({ user, token });
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      return res.status(500).json({ message: 'Erro ao registrar usuário' });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const result = await query(
        'SELECT id, name, email, password_hash, role, created_at FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ message: 'E-mail ou senha inválidos' });
      }

      const userRow = result.rows[0];
      const passwordMatch = userRow.password_hash
        ? await bcrypt.compare(password, userRow.password_hash)
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
    } catch (error) {
      console.error('Erro ao autenticar usuário:', error);
      return res.status(500).json({ message: 'Erro ao realizar login' });
    }
  }

  static async me(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const result = await query(
        'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
        [userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      return res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      return res.status(500).json({ message: 'Erro ao buscar dados do usuário autenticado' });
    }
  }
}
