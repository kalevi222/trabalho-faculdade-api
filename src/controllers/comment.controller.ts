import { Request, Response } from 'express';
import { query } from '../config/db';

export class CommentController {
  // GET /comments - Listar comentários (opcionalmente filtrando por ?task_id=)
  static async getAll(req: Request, res: Response) {
    try {
      const { task_id } = req.query;

      let sql = `
        SELECT
          c.*,
          u.name as author_name,
          u.email as author_email,
          t.title as task_title
        FROM comments c
        INNER JOIN users u ON c.user_id = u.id
        INNER JOIN tasks t ON c.task_id = t.id
      `;
      const params: any[] = [];

      if (task_id) {
        sql += ' WHERE c.task_id = $1';
        params.push(task_id);
      }

      sql += ' ORDER BY c.id ASC';

      const result = await query(sql, params);
      return res.status(200).json(result.rows);
    } catch (error) {
      console.error('Erro ao buscar comentários:', error);
      return res.status(500).json({ message: 'Erro ao buscar comentários no banco de dados' });
    }
  }

  // GET /comments/:id - Buscar comentário por ID
  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await query(
        `SELECT
           c.*,
           u.name as author_name,
           u.email as author_email,
           t.title as task_title
         FROM comments c
         INNER JOIN users u ON c.user_id = u.id
         INNER JOIN tasks t ON c.task_id = t.id
         WHERE c.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: `Comentário com ID ${id} não foi encontrado` });
      }

      return res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao buscar comentário:', error);
      return res.status(500).json({ message: 'Erro ao buscar comentário' });
    }
  }

  // POST /comments - Criar novo comentário vinculado à tarefa e ao usuário autenticado
  static async create(req: Request, res: Response) {
    try {
      const { content, task_id } = req.body;
      const userId = req.user?.id;

      const taskCheck = await query('SELECT id FROM tasks WHERE id = $1', [task_id]);
      if (taskCheck.rows.length === 0) {
        return res.status(404).json({ message: `Tarefa com ID ${task_id} não existe` });
      }

      const result = await query(
        `INSERT INTO comments (content, task_id, user_id)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [content, task_id, userId]
      );

      return res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao criar comentário:', error);
      return res.status(500).json({ message: 'Erro ao cadastrar comentário' });
    }
  }

  // PUT /comments/:id - Atualizar comentário (apenas autor ou ADMIN)
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { content } = req.body;

      const commentCheck = await query('SELECT * FROM comments WHERE id = $1', [id]);
      if (commentCheck.rows.length === 0) {
        return res.status(404).json({ message: `Comentário com ID ${id} não foi encontrado` });
      }

      const current = commentCheck.rows[0];
      if (req.user?.id !== current.user_id && req.user?.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Você só pode editar seus próprios comentários' });
      }

      const result = await query(
        `UPDATE comments
         SET content = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING *`,
        [content, id]
      );

      return res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao atualizar comentário:', error);
      return res.status(500).json({ message: 'Erro ao atualizar comentário' });
    }
  }

  // DELETE /comments/:id - Excluir comentário (apenas autor ou ADMIN)
  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const commentCheck = await query('SELECT * FROM comments WHERE id = $1', [id]);

      if (commentCheck.rows.length === 0) {
        return res.status(404).json({ message: `Comentário com ID ${id} não foi encontrado` });
      }

      const current = commentCheck.rows[0];
      if (req.user?.id !== current.user_id && req.user?.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Você só pode excluir seus próprios comentários' });
      }

      const result = await query('DELETE FROM comments WHERE id = $1 RETURNING *', [id]);

      return res.status(200).json({
        message: `Comentário com ID ${id} removido com sucesso`,
        deletedComment: result.rows[0],
      });
    } catch (error) {
      console.error('Erro ao deletar comentário:', error);
      return res.status(500).json({ message: 'Erro ao deletar comentário' });
    }
  }
}
