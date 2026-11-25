import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../config/db';

const PUBLIC_USER_FIELDS = 'id, name, email, role, created_at';

export class UserController {
  // GET /users - Listar todos os usuários (sem expor password_hash)
  static async getAll(req: Request, res: Response) {
    try {
      const result = await query(`SELECT ${PUBLIC_USER_FIELDS} FROM users ORDER BY id ASC`);
      return res.status(200).json(result.rows);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      return res.status(500).json({ message: 'Erro ao buscar usuários no banco de dados' });
    }
  }

  // GET /users/:id - Buscar usuário por ID
  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await query(`SELECT ${PUBLIC_USER_FIELDS} FROM users WHERE id = $1`, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ message: `Usuário com ID ${id} não foi encontrado` });
      }

      return res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      return res.status(500).json({ message: 'Erro ao buscar usuário' });
    }
  }

  // POST /users - Criar novo usuário (apenas ADMIN)
  static async create(req: Request, res: Response) {
    try {
      const { name, email, password, role } = req.body;

      const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
      if (existing.rows.length > 0) {
        return res.status(409).json({ message: 'Já existe um usuário cadastrado com este e-mail' });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const result = await query(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES ($1, $2, $3, $4)
         RETURNING ${PUBLIC_USER_FIELDS}`,
        [name, email, passwordHash, role || 'MEMBER']
      );

      return res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      return res.status(500).json({ message: 'Erro ao cadastrar usuário' });
    }
  }

  // PUT /users/:id - Atualizar dados do próprio usuário
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const targetId = Number(id);

      if (!req.user || req.user.id !== targetId) {
        return res.status(403).json({ message: 'Você só pode editar o seu próprio perfil' });
      }

      const { name, email, password, role } = req.body;

      const userCheck = await query('SELECT * FROM users WHERE id = $1', [targetId]);
      if (userCheck.rows.length === 0) {
        return res.status(404).json({ message: `Usuário com ID ${id} não foi encontrado` });
      }

      if (email) {
        const emailCheck = await query('SELECT id FROM users WHERE email = $1 AND id != $2', [
          email,
          targetId,
        ]);
        if (emailCheck.rows.length > 0) {
          return res
            .status(409)
            .json({ message: 'Este e-mail já está sendo utilizado por outro usuário' });
        }
      }

      const currentUser = userCheck.rows[0];
      const updatedName = name ?? currentUser.name;
      const updatedEmail = email ?? currentUser.email;
      const updatedPasswordHash = password
        ? await bcrypt.hash(password, 10)
        : currentUser.password_hash;
      const updatedRole =
        req.user.role === 'ADMIN' && role !== undefined ? role : currentUser.role;

      const result = await query(
        `UPDATE users
         SET name = $1, email = $2, password_hash = $3, role = $4
         WHERE id = $5
         RETURNING ${PUBLIC_USER_FIELDS}`,
        [updatedName, updatedEmail, updatedPasswordHash, updatedRole, targetId]
      );

      return res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      return res.status(500).json({ message: 'Erro ao atualizar usuário' });
    }
  }

  // DELETE /users/:id - Excluir usuário (apenas ADMIN)
  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await query(
        `DELETE FROM users WHERE id = $1 RETURNING ${PUBLIC_USER_FIELDS}`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: `Usuário com ID ${id} não foi encontrado` });
      }

      return res.status(200).json({
        message: `Usuário com ID ${id} removido com sucesso`,
        deletedUser: result.rows[0],
      });
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      return res.status(500).json({ message: 'Erro ao deletar usuário' });
    }
  }
}
