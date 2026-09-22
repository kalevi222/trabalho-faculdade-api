import { Request, Response } from 'express';
import { query } from '../config/db';

export class ProjectController {
  // GET /projects - Listar todos os projetos (com dados do proprietário)
  static async getAll(req: Request, res: Response) {
    try {
      const result = await query(`
        SELECT p.*, u.name as owner_name, u.email as owner_email
        FROM projects p
        INNER JOIN users u ON p.owner_id = u.id
        ORDER BY p.id ASC
      `);
      return res.status(200).json(result.rows);
    } catch (error) {
      console.error('Erro ao buscar projetos:', error);
      return res.status(500).json({ message: 'Erro ao buscar projetos no banco de dados' });
    }
  }

  // GET /projects/:id - Buscar projeto por ID
  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await query(`
        SELECT p.*, u.name as owner_name, u.email as owner_email
        FROM projects p
        INNER JOIN users u ON p.owner_id = u.id
        WHERE p.id = $1
      `, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ message: `Projeto com ID ${id} não foi encontrado` });
      }

      return res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao buscar projeto:', error);
      return res.status(500).json({ message: 'Erro ao buscar projeto' });
    }
  }

  // POST /projects - Criar novo projeto
  static async create(req: Request, res: Response) {
    try {
      const { title, description, owner_id } = req.body;

      // Verificar se o usuário proprietário existe
      const ownerCheck = await query('SELECT id FROM users WHERE id = $1', [owner_id]);
      if (ownerCheck.rows.length === 0) {
        return res.status(404).json({ message: `Usuário proprietário com ID ${owner_id} não existe` });
      }

      const result = await query(
        'INSERT INTO projects (title, description, owner_id) VALUES ($1, $2, $3) RETURNING *',
        [title, description || null, owner_id]
      );

      return res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
      return res.status(500).json({ message: 'Erro ao cadastrar projeto' });
    }
  }

  // PUT /projects/:id - Atualizar projeto
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { title, description, owner_id } = req.body;

      // Verifica se projeto existe
      const projectCheck = await query('SELECT * FROM projects WHERE id = $1', [id]);
      if (projectCheck.rows.length === 0) {
        return res.status(404).json({ message: `Projeto com ID ${id} não foi encontrado` });
      }

      // Se informou novo owner_id, verificar se existe
      if (owner_id) {
        const ownerCheck = await query('SELECT id FROM users WHERE id = $1', [owner_id]);
        if (ownerCheck.rows.length === 0) {
          return res.status(404).json({ message: `Usuário proprietário com ID ${owner_id} não existe` });
        }
      }

      const current = projectCheck.rows[0];
      const updatedTitle = title ?? current.title;
      const updatedDesc = description !== undefined ? description : current.description;
      const updatedOwnerId = owner_id ?? current.owner_id;

      const result = await query(
        'UPDATE projects SET title = $1, description = $2, owner_id = $3 WHERE id = $4 RETURNING *',
        [updatedTitle, updatedDesc, updatedOwnerId, id]
      );

      return res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao atualizar projeto:', error);
      return res.status(500).json({ message: 'Erro ao atualizar projeto' });
    }
  }

  // DELETE /projects/:id - Excluir projeto
  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await query('DELETE FROM projects WHERE id = $1 RETURNING *', [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ message: `Projeto com ID ${id} não foi encontrado` });
      }

      return res.status(200).json({
        message: `Projeto com ID ${id} removido com sucesso`,
        deletedProject: result.rows[0],
      });
    } catch (error) {
      console.error('Erro ao deletar projeto:', error);
      return res.status(500).json({ message: 'Erro ao deletar projeto' });
    }
  }
}
