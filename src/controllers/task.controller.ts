import { Request, Response } from 'express';
import { query } from '../config/db';

export class TaskController {
  // GET /tasks - Listar todas as tarefas (com dados de projeto e usuário atribuído)
  static async getAll(req: Request, res: Response) {
    try {
      const result = await query(`
        SELECT 
          t.*,
          p.title as project_title,
          u.name as assigned_user_name,
          u.email as assigned_user_email
        FROM tasks t
        INNER JOIN projects p ON t.project_id = p.id
        LEFT JOIN users u ON t.assigned_to = u.id
        ORDER BY t.id ASC
      `);
      return res.status(200).json(result.rows);
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
      return res.status(500).json({ message: 'Erro ao buscar tarefas no banco de dados' });
    }
  }

  // GET /tasks/:id - Buscar tarefa por ID
  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await query(`
        SELECT 
          t.*,
          p.title as project_title,
          u.name as assigned_user_name,
          u.email as assigned_user_email
        FROM tasks t
        INNER JOIN projects p ON t.project_id = p.id
        LEFT JOIN users u ON t.assigned_to = u.id
        WHERE t.id = $1
      `, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ message: `Tarefa com ID ${id} não foi encontrada` });
      }

      return res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao buscar tarefa:', error);
      return res.status(500).json({ message: 'Erro ao buscar tarefa' });
    }
  }

  // POST /tasks - Criar nova tarefa
  static async create(req: Request, res: Response) {
    try {
      const { title, description, status, project_id, assigned_to } = req.body;

      // Verificar se o projeto existe
      const projectCheck = await query('SELECT id FROM projects WHERE id = $1', [project_id]);
      if (projectCheck.rows.length === 0) {
        return res.status(404).json({ message: `Projeto com ID ${project_id} não existe` });
      }

      // Se passou assigned_to, verificar se o usuário existe
      if (assigned_to) {
        const userCheck = await query('SELECT id FROM users WHERE id = $1', [assigned_to]);
        if (userCheck.rows.length === 0) {
          return res.status(404).json({ message: `Usuário com ID ${assigned_to} não existe` });
        }
      }

      const result = await query(
        `INSERT INTO tasks (title, description, status, project_id, assigned_to) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING *`,
        [title, description || null, status || 'PENDING', project_id, assigned_to || null]
      );

      return res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      return res.status(500).json({ message: 'Erro ao cadastrar tarefa' });
    }
  }

  // PUT /tasks/:id - Atualizar tarefa
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { title, description, status, project_id, assigned_to } = req.body;

      // Verifica se tarefa existe
      const taskCheck = await query('SELECT * FROM tasks WHERE id = $1', [id]);
      if (taskCheck.rows.length === 0) {
        return res.status(404).json({ message: `Tarefa com ID ${id} não foi encontrada` });
      }

      // Se atualizou project_id, verificar se existe
      if (project_id) {
        const projectCheck = await query('SELECT id FROM projects WHERE id = $1', [project_id]);
        if (projectCheck.rows.length === 0) {
          return res.status(404).json({ message: `Projeto com ID ${project_id} não existe` });
        }
      }

      // Se atualizou assigned_to, verificar se existe
      if (assigned_to) {
        const userCheck = await query('SELECT id FROM users WHERE id = $1', [assigned_to]);
        if (userCheck.rows.length === 0) {
          return res.status(404).json({ message: `Usuário com ID ${assigned_to} não existe` });
        }
      }

      const current = taskCheck.rows[0];
      const updatedTitle = title ?? current.title;
      const updatedDesc = description !== undefined ? description : current.description;
      const updatedStatus = status ?? current.status;
      const updatedProjectId = project_id ?? current.project_id;
      const updatedAssignedTo = assigned_to !== undefined ? assigned_to : current.assigned_to;

      const result = await query(
        `UPDATE tasks 
         SET title = $1, description = $2, status = $3, project_id = $4, assigned_to = $5 
         WHERE id = $6 
         RETURNING *`,
        [updatedTitle, updatedDesc, updatedStatus, updatedProjectId, updatedAssignedTo, id]
      );

      return res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      return res.status(500).json({ message: 'Erro ao atualizar tarefa' });
    }
  }

  // DELETE /tasks/:id - Excluir tarefa
  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ message: `Tarefa com ID ${id} não foi encontrada` });
      }

      return res.status(200).json({
        message: `Tarefa com ID ${id} removida com sucesso`,
        deletedTask: result.rows[0],
      });
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error);
      return res.status(500).json({ message: 'Erro ao deletar tarefa' });
    }
  }
}
