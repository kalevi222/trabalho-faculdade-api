export type UserRole = 'ADMIN' | 'MEMBER';
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at?: string;
}

export interface Project {
  id: number;
  title: string;
  description: string | null;
  owner_id: number;
  owner_name?: string;
  owner_email?: string;
  created_at?: string;
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  project_id: number;
  project_title?: string;
  assigned_to: number | null;
  assigned_user_name?: string | null;
  assigned_user_email?: string | null;
  created_at?: string;
}

export interface Comment {
  id: number;
  content: string;
  task_id: number;
  task_title?: string;
  user_id: number;
  author_name?: string;
  author_email?: string;
  created_at?: string;
  updated_at?: string;
}
