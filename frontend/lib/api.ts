const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type ApiResponse<T> = {
  success: boolean;
  data: T;
  error?: {
    message: string;
    details?: unknown;
  };
};

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
};

class ApiClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private workspaceId: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('accessToken');
      this.refreshToken = localStorage.getItem('refreshToken');
      this.workspaceId = localStorage.getItem('workspaceId');
    }
  }

  setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    }
  }

  setWorkspaceId(workspaceId: string) {
    this.workspaceId = workspaceId;
    if (typeof window !== 'undefined') {
      localStorage.setItem('workspaceId', workspaceId);
    }
  }

  getWorkspaceId() {
    return this.workspaceId;
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    this.workspaceId = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('workspaceId');
    }
  }

  isAuthenticated() {
    return !!this.accessToken;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    if (this.workspaceId) {
      headers['x-workspace-id'] = this.workspaceId;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = (await response.json()) as ApiResponse<T>;

    if (!response.ok) {
      if (response.status === 401 && this.refreshToken) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          return this.request<T>(endpoint, options);
        }
      }
      throw new Error(data.error?.message || 'Request failed');
    }

    return data;
  }

  // Generic HTTP methods
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint);
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  private async refreshAccessToken(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        this.setTokens(data.data.accessToken, data.data.refreshToken);
        return true;
      }
    } catch {
      // Refresh failed
    }
    this.clearTokens();
    return false;
  }

  // Auth
  async register(email: string, password: string, fullName: string) {
    return this.request<{ id: string; email: string; fullName: string }>(
      '/api/v1/auth/register',
      {
        method: 'POST',
        body: JSON.stringify({ email, password, fullName }),
      }
    );
  }

  async login(email: string, password: string) {
    const response = await this.request<{
      accessToken: string;
      refreshToken: string;
    }>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success) {
      this.setTokens(response.data.accessToken, response.data.refreshToken);
    }

    return response;
  }

  async logout() {
    if (this.refreshToken) {
      await this.request('/api/v1/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });
    }
    this.clearTokens();
  }

  // Workspaces
  async getWorkspaces() {
    return this.request<
      Array<{
        role: string;
        workspace: {
          id: string;
          name: string;
          type: string;
          ownerUserId: string;
        };
      }>
    >('/api/v1/workspaces/mine');
  }

  async createWorkspace(name: string, type: 'FAMILY' | 'FRIENDS') {
    return this.request<{
      id: string;
      name: string;
      type: string;
      ownerUserId: string;
    }>('/api/v1/workspaces', {
      method: 'POST',
      body: JSON.stringify({ name, type }),
    });
  }

  // Habits
  async getHabitSets() {
    return this.request<
      Array<{
        id: string;
        userId: string;
        title: string;
        goalDescription?: string;
        cycleUnit: string;
        cycleLength: number;
        startDate: string;
        endDate: string;
        status: string;
        habits: Array<{
          id: string;
          name: string;
          targetCountPerDay: number;
        }>;
      }>
    >('/api/v1/habits/sets');
  }

  async createHabitSet(data: {
    title: string;
    goalDescription?: string;
    cycleUnit: 'DAY' | 'WEEK' | 'MONTH';
    cycleLength: number;
    startDate: string;
    habits: Array<{ name: string; targetCountPerDay?: number }>;
  }) {
    return this.request<{
      id: string;
      userId: string;
      title: string;
      habits: Array<{ id: string; name: string; targetCountPerDay: number }>;
    }>('/api/v1/habits/sets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createHabitCheckin(data: {
    habitId: string;
    checkinDate: string;
    status: 'DONE' | 'NOT_DONE';
    note?: string;
  }) {
    return this.request<{
      id: string;
      habitId: string;
      status: string;
      note?: string;
      checkinDate: string;
    }>('/api/v1/habits/checkins', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Plans
  async getPlans() {
    return this.request<
      Array<{
        id: string;
        type: string;
        title: string;
        description?: string;
        periodStart: string;
        periodEnd: string;
        userId: string;
        items: Array<{
          id: string;
          title: string;
          description?: string;
          dueDate?: string;
          status: string;
          isRecurring: boolean;
        }>;
      }>
    >('/api/v1/plans');
  }

  async createPlan(data: {
    type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
    title: string;
    description?: string;
    periodStart: string;
    periodEnd: string;
  }) {
    return this.request<{
      id: string;
      type: string;
      title: string;
      userId: string;
    }>('/api/v1/plans', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async addPlanItem(
    planId: string,
    data: {
      title: string;
      description?: string;
      dueDate?: string;
      isRecurring?: boolean;
      recurrenceRule?: string;
      lifetimePreset?: 'DAYS' | 'WEEK' | 'MONTH' | 'RANGE';
      lifetimeValue?: number;
      lifetimeStart?: string;
      lifetimeEnd?: string;
    }
  ) {
    return this.request<{
      id: string;
      planId: string;
      title: string;
    }>(`/api/v1/plans/${planId}/items`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePlanItem(itemId: string, data: Partial<{
    title: string;
    description?: string;
    dueDate?: string | null;
    status: 'TODO' | 'DOING' | 'DONE' | 'SKIPPED';
    isRecurring: boolean;
    recurrenceRule?: string | null;
    lifetimePreset?: 'DAYS' | 'WEEK' | 'MONTH' | 'RANGE';
    lifetimeValue?: number;
    lifetimeStart?: string;
    lifetimeEnd?: string;
  }>) {
    return this.request<{ id: string }>(`/api/v1/plans/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deletePlan(planId: string) {
    return this.request<{ id: string }>(`/api/v1/plans/${planId}`, { method: 'DELETE' });
  }

  async deletePlanItem(itemId: string) {
    return this.request<{ id: string }>(`/api/v1/plans/items/${itemId}`, { method: 'DELETE' });
  }

  // Pocket
  async createWallet(data: { name: string; type: string; provider?: string; balance?: number }) {
    return this.request<{
      id: string;
      workspaceId: string;
      name: string;
      type: string;
      provider?: string;
      balance: number;
    }>('/api/v1/pocket/wallets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateWallet(walletId: string, data: { name: string; type: string; provider?: string; balance?: number }) {
    return this.request<{
      id: string;
      workspaceId: string;
      name: string;
      type: string;
      provider?: string;
      balance: number;
    }>(`/api/v1/pocket/wallets/${walletId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteWallet(walletId: string) {
    return this.request<{ id: string }>(`/api/v1/pocket/wallets/${walletId}`, {
      method: 'DELETE',
    });
  }

  async createTransaction(data: {
    kind: 'INCOME' | 'EXPENSE' | 'TRANSFER';
    amount: number;
    occurredAt: string;
    sourceWalletId?: string;
    destinationWalletId?: string;
    description?: string;
  }) {
    return this.request<{
      id: string;
      kind: string;
      amount: number;
      workspaceId: string;
    }>('/api/v1/pocket/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTransaction(
    transactionId: string,
    data: {
      kind: 'INCOME' | 'EXPENSE' | 'TRANSFER';
      amount: number;
      occurredAt: string;
      sourceWalletId?: string;
      destinationWalletId?: string;
      description?: string;
    }
  ) {
    return this.request<{
      id: string;
      kind: string;
      amount: number;
    }>(`/api/v1/pocket/transactions/${transactionId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteTransaction(transactionId: string) {
    return this.request<{ id: string }>(`/api/v1/pocket/transactions/${transactionId}`, {
      method: 'DELETE',
    });
  }

  // Projects
  async getProjects() {
    return this.request<
      Array<{
        id: string;
        name: string;
        description?: string;
        deadline?: string;
        budgetAmount?: number;
        workspaceId: string;
        status: string;
        tasks: Array<{
          id: string;
          title: string;
          description?: string;
          dueDate?: string;
          priority: string;
          status: string;
        }>;
        comments: Array<{
          id: string;
          body: string;
          taskId?: string;
          createdAt: string;
          author: { name: string };
        }>;
      }>
    >('/api/v1/projects');
  }

  async createProject(data: {
    name: string;
    description?: string;
    deadline?: string;
    budgetAmount?: number;
  }) {
    return this.request<{
      id: string;
      name: string;
      workspaceId: string;
    }>('/api/v1/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async addProjectTask(
    projectId: string,
    data: {
      title: string;
      description?: string;
      dueDate?: string;
      priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    }
  ) {
    return this.request<{
      id: string;
      projectId: string;
      title: string;
    }>(`/api/v1/projects/${projectId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async addProjectComment(
    projectId: string,
    data: {
      taskId?: string;
      body: string;
    }
  ) {
    return this.request<{
      id: string;
      projectId: string;
      body: string;
    }>(`/api/v1/projects/${projectId}/comments`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

const apiClient = new ApiClient();

export default apiClient;