import { Request, Response } from 'express';
import { query } from '../config/db';

export class UserController {
  // GET /users - Listar todos os usuários
  static async getAll(req: Request, res: Response) {
    try {
      const result = await query('SELECT * FROM users ORDER BY id ASC');
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
      const result = await query('SELECT * FROM users WHERE id = $1', [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ message: `Usuário com ID ${id} não foi encontrado` });
      }

      return res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      return res.status(500).json({ message: 'Erro ao buscar usuário' });
    }
  }

  // POST /users - Criar novo usuário
  static async create(req: Request, res: Response) {
    try {
      const { name, email, role } = req.body;

      // Verificar se e-mail já existe
      const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
      if (existing.rows.length > 0) {
        return res.status(409).json({ message: 'Já existe um usuário cadastrado com este e-mail' });
      }

      const result = await query(
        'INSERT INTO users (name, email, role) VALUES ($1, $2, $3) RETURNING *',
        [name, email, role || 'MEMBER']
      );

      return res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      return res.status(500).json({ message: 'Erro ao cadastrar usuário' });
    }
  }

  // PUT /users/:id - Atualizar dados do usuário
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, email, role } = req.body;

      // Verifica se usuário existe
      const userCheck = await query('SELECT * FROM users WHERE id = $1', [id]);
      if (userCheck.rows.length === 0) {
        return res.status(404).json({ message: `Usuário com ID ${id} não foi encontrado` });
      }

      // Se alterou e-mail, verificar se já pertence a outro usuário
      if (email) {
        const emailCheck = await query('SELECT id FROM users WHERE email = $1 AND id != $2', [email, id]);
        if (emailCheck.rows.length > 0) {
          return res.status(409).json({ message: 'Este e-mail já está sendo utilizado por outro usuário' });
        }
      }

      const currentUser = userCheck.rows[0];
      const updatedName = name ?? currentUser.name;
      const updatedEmail = email ?? currentUser.email;
      const updatedRole = role ?? currentUser.role;

      const result = await query(
        'UPDATE users SET name = $1, email = $2, role = $3 WHERE id = $4 RETURNING *',
        [updatedName, updatedEmail, updatedRole, id]
      );

      return res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      return res.status(500).json({ message: 'Erro ao atualizar usuário' });
    }
  }

  // DELETE /users/:id - Excluir usuário
  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);

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
