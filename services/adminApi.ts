import { getAuthToken } from './api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function adminFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'حدث خطأ غير متوقع');
  }

  return data as T;
}

// ─── Types ───────────────────────────────────────────────────────

export interface AdminDashboardStats {
  users: {
    total: number;
    newThisWeek: number;
    byProvider: Record<string, number>;
  };
  habits: {
    totalEntries: number;
    totalCategories: number;
  };
  templates: {
    total: number;
    topTemplates: {
      _id: string;
      name: string;
      authorName: string;
      usageCount: number;
      createdAt: string;
    }[];
  };
  groups: {
    total: number;
    avgSize: number;
    maxSize: number;
    totalMembers: number;
  };
}

export interface AdminUser {
  _id: string;
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  provider: 'google' | 'local';
  showOnLeaderboard: boolean;
  createdAt: string;
}

export interface AdminUserListResponse {
  users: AdminUser[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface AdminTemplate {
  _id: string;
  name: string;
  description: string;
  authorName: string;
  authorUid: string;
  categories: { categoryId: string; name: string; icon: string; items: { id: string; label: string; type: string }[] }[];
  usageCount: number;
  createdAt: string;
}

export interface AdminTemplateListResponse {
  templates: AdminTemplate[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface AdminGroup {
  _id: string;
  name: string;
  adminUid: string;
  memberCount: number;
  inviteCode: string;
  categoryCount: number;
  createdAt: string;
}

export interface AdminGroupListResponse {
  groups: AdminGroup[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

// ─── API Methods ─────────────────────────────────────────────────

export function getAdminStats(): Promise<AdminDashboardStats> {
  return adminFetch<AdminDashboardStats>('/admin/stats');
}

export function getAdminUsers(
  page = 1,
  pageSize = 20,
  search = ''
): Promise<AdminUserListResponse> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (search) params.set('search', search);
  return adminFetch<AdminUserListResponse>(`/admin/users?${params}`);
}

export function getAdminTemplates(
  page = 1,
  pageSize = 20,
  search = ''
): Promise<AdminTemplateListResponse> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (search) params.set('search', search);
  return adminFetch<AdminTemplateListResponse>(`/admin/templates?${params}`);
}

export function adminDeleteTemplate(templateId: string): Promise<{ message: string }> {
  return adminFetch<{ message: string }>(`/admin/templates/${templateId}`, {
    method: 'DELETE',
  });
}

export function getAdminGroups(
  page = 1,
  pageSize = 20
): Promise<AdminGroupListResponse> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  return adminFetch<AdminGroupListResponse>(`/admin/groups?${params}`);
}

export function adminDeleteGroup(groupId: string): Promise<{ message: string }> {
  return adminFetch<{ message: string }>(`/admin/groups/${groupId}`, {
    method: 'DELETE',
  });
}
