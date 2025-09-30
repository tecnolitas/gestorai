import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  User, 
  Project, 
  Task, 
  Comment,
  TaskHistory,
  LoginCredentials, 
  LoginResponse, 
  PaginatedResponse 
} from '@/types/api';

class ApiService {
  private api: AxiosInstance;
  private baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  constructor() {
    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para agregar el token de autenticación
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Token ${token}`;
      }
      return config;
    });

    // Interceptor para manejar errores
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Autenticación
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response: AxiosResponse<LoginResponse> = await this.api.post('/api/auth/login/', credentials);
    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    const response: AxiosResponse<User> = await this.api.get('/api/users/me/');
    return response.data;
  }

  // Proyectos
  async getProjects(): Promise<PaginatedResponse<Project>> {
    const response: AxiosResponse<PaginatedResponse<Project>> = await this.api.get('/api/projects/');
    return response.data;
  }

  async getProject(id: number): Promise<Project> {
    const response: AxiosResponse<Project> = await this.api.get(`/api/projects/${id}/`);
    return response.data;
  }

  async createProject(project: Partial<Project>): Promise<Project> {
    const response: AxiosResponse<Project> = await this.api.post('/api/projects/', project);
    return response.data;
  }

  async updateProject(id: number, project: Partial<Project>): Promise<Project> {
    const response: AxiosResponse<Project> = await this.api.patch(`/api/projects/${id}/`, project);
    return response.data;
  }

  async deleteProject(id: number): Promise<void> {
    await this.api.delete(`/api/projects/${id}/`);
  }

  // Tareas
  async getTasks(): Promise<PaginatedResponse<Task>> {
    const response: AxiosResponse<PaginatedResponse<Task>> = await this.api.get('/api/tasks/');
    return response.data;
  }

  async getTask(id: number): Promise<Task> {
    const response: AxiosResponse<Task> = await this.api.get(`/tasks/${id}/`);
    return response.data;
  }

  async createTask(task: Partial<Task>): Promise<Task> {
    const response: AxiosResponse<Task> = await this.api.post('/api/tasks/', task);
    return response.data;
  }

  async updateTask(id: number, task: Partial<Task>): Promise<Task> {
    console.log('API: Enviando PATCH a /tasks/${id}/');
    console.log('API: Datos enviados:', task);
    
    const response: AxiosResponse<Task> = await this.api.patch(`/tasks/${id}/`, task);
    
    console.log('API: Respuesta recibida:', response.status);
    console.log('API: Datos de respuesta:', response.data);
    
    return response.data;
  }

  async deleteTask(id: number): Promise<void> {
    await this.api.delete(`/tasks/${id}/`);
  }

  async toggleTaskComplete(id: number): Promise<Task> {
    const response: AxiosResponse<Task> = await this.api.post(`/tasks/${id}/toggle_complete/`);
    return response.data;
  }

  async getCompletedTasks(): Promise<PaginatedResponse<Task>> {
    const response: AxiosResponse<PaginatedResponse<Task>> = await this.api.get('/api/tasks/completed/');
    return response.data;
  }

  async getPendingTasks(): Promise<PaginatedResponse<Task>> {
    const response: AxiosResponse<PaginatedResponse<Task>> = await this.api.get('/api/tasks/pending/');
    return response.data;
  }

  async getMyTasks(): Promise<PaginatedResponse<Task>> {
    const response: AxiosResponse<PaginatedResponse<Task>> = await this.api.get('/api/tasks/');
    return response.data;
  }

  // Perfil de usuario
  async updateProfile(profileData: { first_name?: string; last_name?: string; email?: string }): Promise<User> {
    const response: AxiosResponse<User> = await this.api.patch('/api/auth/user/', profileData);
    return response.data;
  }

  async changePassword(passwordData: { current_password: string; new_password: string }): Promise<void> {
    await this.api.post('/api/auth/change-password/', passwordData);
  }

  // Comentarios
  async getTaskComments(taskId: number): Promise<Comment[]> {
    const response: AxiosResponse<Comment[]> = await this.api.get(`/tasks/${taskId}/comments/`);
    return response.data;
  }

  async createComment(taskId: number, content: string): Promise<Comment> {
    const response: AxiosResponse<Comment> = await this.api.post(`/tasks/${taskId}/comments/`, { content });
    return response.data;
  }

  async updateComment(taskId: number, commentId: number, content: string): Promise<Comment> {
    const response: AxiosResponse<Comment> = await this.api.patch(`/tasks/${taskId}/comments/${commentId}/`, { content });
    return response.data;
  }

  async deleteComment(taskId: number, commentId: number): Promise<void> {
    await this.api.delete(`/tasks/${taskId}/comments/${commentId}/`);
  }

  // Historial
  async getTaskHistory(taskId: number): Promise<TaskHistory[]> {
    const response: AxiosResponse<TaskHistory[]> = await this.api.get(`/tasks/${taskId}/history/`);
    return response.data;
  }

  // Gráficos y estadísticas
  async getTasksCompletedByPeriod(): Promise<{ labels: string[]; datasets: any[] }> {
    const response: AxiosResponse<{ labels: string[]; datasets: any[] }> = await this.api.get('/api/charts/tasks_completed_by_period/');
    return response.data;
  }

  async getProjectProgress(): Promise<{ labels: string[]; datasets: any[] }> {
    const response: AxiosResponse<{ labels: string[]; datasets: any[] }> = await this.api.get('/api/charts/project_progress/');
    return response.data;
  }

  async getPriorityDistribution(): Promise<{ labels: string[]; datasets: any[] }> {
    const response: AxiosResponse<{ labels: string[]; datasets: any[] }> = await this.api.get('/api/charts/priority_distribution/');
    return response.data;
  }

  async getUserActivity(): Promise<{ labels: string[]; datasets: any[] }> {
    const response: AxiosResponse<{ labels: string[]; datasets: any[] }> = await this.api.get('/api/charts/user_activity/');
    return response.data;
  }

  async getDashboardStats(): Promise<{
    totalProjects: number;
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    completedThisWeek: number;
    activeProjects: number;
  }> {
    const response: AxiosResponse<{
      totalProjects: number;
      totalTasks: number;
      completedTasks: number;
      pendingTasks: number;
      completedThisWeek: number;
      activeProjects: number;
    }> = await this.api.get('/api/charts/dashboard_stats/');
    return response.data;
  }

  async getTasksDetailedReport(filters?: {
    startDate?: string;
    endDate?: string;
    projectId?: string;
    userId?: string;
    priority?: string;
  }): Promise<{
    taskStats: {
      totalCompleted: number;
      totalPending: number;
      averageCompletionTime: number;
      overdueTasks: number;
      completionRate: number;
      priorityBreakdown: {
        [key: string]: {
          completed: number;
          pending: number;
          overdue: number;
        };
      };
    };
    completedTasks: Array<{
      id: number;
      title: string;
      project: string;
      assignee: string;
      priority: string;
      completed_at: string;
      days_to_complete: number;
      status: string;
    }>;
    pendingTasks: Array<{
      id: number;
      title: string;
      project: string;
      assignee: string;
      priority: string;
      due_date: string;
      days_overdue: number;
      status: string;
    }>;
  }> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('start_date', filters.startDate);
    if (filters?.endDate) params.append('end_date', filters.endDate);
    if (filters?.projectId) params.append('project_id', filters.projectId);
    if (filters?.userId) params.append('user_id', filters.userId);
    if (filters?.priority) params.append('priority', filters.priority);

    const response: AxiosResponse<{
      taskStats: any;
      completedTasks: any[];
      pendingTasks: any[];
    }> = await this.api.get(`/charts/tasks_detailed_report/?${params.toString()}`);
    return response.data;
  }

  async getTemporalComparison(filters?: {
    startDate?: string;
    endDate?: string;
    projectId?: string;
    userId?: string;
    priority?: string;
    period?: 'daily' | 'weekly' | 'monthly';
  }): Promise<{
    period: string;
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      type: string;
    }>;
  }> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('start_date', filters.startDate);
    if (filters?.endDate) params.append('end_date', filters.endDate);
    if (filters?.projectId) params.append('project_id', filters.projectId);
    if (filters?.userId) params.append('user_id', filters.userId);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.period) params.append('period', filters.period);

    const response: AxiosResponse<{
      period: string;
      labels: string[];
      datasets: Array<{
        label: string;
        data: number[];
        type: string;
      }>;
    }> = await this.api.get(`/charts/temporal_comparison/?${params.toString()}`);
    return response.data;
  }

  async getProjectTimeReport(filters?: {
    startDate?: string;
    endDate?: string;
    projectId?: string;
    userId?: string;
  }): Promise<{
    projects: Array<{
      id: number;
      name: string;
      description: string;
      totalTasks: number;
      completedTasks: number;
      pendingTasks: number;
      overdueTasks: number;
      progress: number;
      estimatedHours: number;
      actualHours: number;
      avgTimePerTask: number;
      priorityBreakdown: {
        [key: string]: {
          total: number;
          completed: number;
          pending: number;
        };
      };
      assignedUsers: string[];
      recentTasks: Array<{
        id: number;
        title: string;
        assignee: string;
        priority: string;
        status: string;
        created_at: string;
      }>;
      createdAt: string;
    }>;
    summary: {
      totalProjects: number;
      avgProgress: number;
      totalEstimatedHours: number;
      totalActualHours: number;
      efficiency: number;
    };
  }> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('start_date', filters.startDate);
    if (filters?.endDate) params.append('end_date', filters.endDate);
    if (filters?.projectId) params.append('project_id', filters.projectId);
    if (filters?.userId) params.append('user_id', filters.userId);

    const response: AxiosResponse<{
      projects: any[];
      summary: any;
    }> = await this.api.get(`/charts/project_time_report/?${params.toString()}`);
    return response.data;
  }

  async getUserProductivityReport(filters?: {
    startDate?: string;
    endDate?: string;
    projectId?: string;
    userId?: string;
  }): Promise<{
    users: Array<{
      id: number;
      username: string;
      firstName: string;
      lastName: string;
      email: string;
      totalTasks: number;
      completedTasks: number;
      pendingTasks: number;
      overdueTasks: number;
      productivity: number;
      estimatedHours: number;
      actualHours: number;
      avgTimePerTask: number;
      efficiency: number;
      priorityBreakdown: {
        [key: string]: {
          total: number;
          completed: number;
          pending: number;
        };
      };
      projects: string[];
      recentTasks: Array<{
        id: number;
        title: string;
        project: string;
        priority: string;
        status: string;
        created_at: string;
      }>;
      recentCompleted: number;
      lastActive: string;
    }>;
    summary: {
      totalUsers: number;
      avgProductivity: number;
      totalEstimatedHours: number;
      totalActualHours: number;
      avgEfficiency: number;
      activeUsers: number;
    };
  }> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('start_date', filters.startDate);
    if (filters?.endDate) params.append('end_date', filters.endDate);
    if (filters?.projectId) params.append('project_id', filters.projectId);
    if (filters?.userId) params.append('user_id', filters.userId);

    const response: AxiosResponse<{
      users: any[];
      summary: any;
    }> = await this.api.get(`/charts/user_productivity_report/?${params.toString()}`);
    return response.data;
  }

  async getProjectsReport(filters?: {
    startDate?: string;
    endDate?: string;
    projectId?: string;
    userId?: string;
  }): Promise<{
    projects: Array<{
      id: number;
      name: string;
      description: string;
      status: string;
      statusLabel: string;
      totalTasks: number;
      completedTasks: number;
      pendingTasks: number;
      overdueTasks: number;
      progress: number;
      estimatedHours: number;
      actualHours: number;
      avgTimePerTask: number;
      efficiency: number;
      priorityBreakdown: {
        [key: string]: {
          total: number;
          completed: number;
          pending: number;
        };
      };
      assignedUsers: string[];
      recentTasks: Array<{
        id: number;
        title: string;
        assignee: string;
        priority: string;
        status: string;
        created_at: string;
      }>;
      recentCompleted: number;
      weeklyCompleted: number;
      createdAt: string;
    }>;
    summary: {
      totalProjects: number;
      avgProgress: number;
      totalEstimatedHours: number;
      totalActualHours: number;
      avgEfficiency: number;
      statusCounts: {
        completed: number;
        on_track: number;
        at_risk: number;
        in_progress: number;
        planning: number;
      };
      activeProjects: number;
    };
  }> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('start_date', filters.startDate);
    if (filters?.endDate) params.append('end_date', filters.endDate);
    if (filters?.projectId) params.append('project_id', filters.projectId);
    if (filters?.userId) params.append('user_id', filters.userId);

    const response: AxiosResponse<{
      projects: any[];
      summary: any;
    }> = await this.api.get(`/charts/projects_report/?${params.toString()}`);
    return response.data;
  }
}

export const apiService = new ApiService(); 