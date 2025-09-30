// Tipos de usuario
export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  is_active: boolean;
  date_joined: string;
}

// Tipos de proyecto
export interface Project {
  id: number;
  name: string;
  description?: string;
  status: string;
  created_at: string;
  updated_at: string;
  owner: number;
  team_members?: number[];
}

// Tipos de tarea
export interface Task {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  created_at: string;
  updated_at: string;
  completed: boolean;
  project?: Project;
  assignee?: User;
  estimated_hours?: number;
  actual_hours?: number;
}

// Tipos de comentario
export interface Comment {
  id: number;
  content: string;
  created_at: string;
  updated_at: string;
  author: User;
  task: number;
}

// Tipos de historial de tarea
export interface TaskHistory {
  id: number;
  task: number;
  action: string;
  old_value?: string;
  new_value?: string;
  created_at: string;
  user: User;
}

// Tipos de autenticación
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// Tipos de respuesta paginada
export interface PaginatedResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}

// Tipos de filtros
export interface TaskFilters {
  status?: string;
  priority?: string;
  project?: number;
  assignee?: number;
  search?: string;
}

export interface ProjectFilters {
  status?: string;
  search?: string;
}