import { useState, useEffect, useCallback } from 'react';
import {
  getAdminStats,
  getAdminUsers,
  getAdminTemplates,
  adminDeleteTemplate,
  getAdminGroups,
  adminDeleteGroup,
  type AdminDashboardStats,
  type AdminUser,
  type AdminTemplate,
  type AdminGroup,
} from '@/services/adminApi';

// ─── Types ───────────────────────────────────────────────────────

interface PaginatedState<T> {
  items: T[];
  page: number;
  totalPages: number;
  totalCount: number;
  isLoading: boolean;
}

export interface UseAdminReturn {
  stats: AdminDashboardStats | null;
  statsLoading: boolean;

  users: PaginatedState<AdminUser>;
  userSearch: string;
  setUserSearch: (value: string) => void;
  fetchUsers: (page?: number) => void;

  templates: PaginatedState<AdminTemplate>;
  templateSearch: string;
  setTemplateSearch: (value: string) => void;
  fetchTemplates: (page?: number) => void;
  removeTemplate: (id: string) => Promise<void>;

  groups: PaginatedState<AdminGroup>;
  fetchGroups: (page?: number) => void;
  removeGroup: (id: string) => Promise<void>;

  error: string | null;
  clearError: () => void;
}

// ─── Hook ────────────────────────────────────────────────────────

const EMPTY_PAGINATED = <T,>(): PaginatedState<T> => ({
  items: [],
  page: 1,
  totalPages: 1,
  totalCount: 0,
  isLoading: false,
});

export function useAdmin(): UseAdminReturn {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Users
  const [users, setUsers] = useState<PaginatedState<AdminUser>>(EMPTY_PAGINATED);
  const [userSearch, setUserSearch] = useState('');

  // Templates
  const [templates, setTemplates] = useState<PaginatedState<AdminTemplate>>(EMPTY_PAGINATED);
  const [templateSearch, setTemplateSearch] = useState('');

  // Groups
  const [groups, setGroups] = useState<PaginatedState<AdminGroup>>(EMPTY_PAGINATED);

  // ── Stats ──
  useEffect(() => {
    setStatsLoading(true);
    getAdminStats()
      .then(setStats)
      .catch((err) => setError(err.message))
      .finally(() => setStatsLoading(false));
  }, []);

  // ── Users ──
  const fetchUsers = useCallback(
    (page = 1) => {
      setUsers((prev) => ({ ...prev, isLoading: true }));
      getAdminUsers(page, 20, userSearch)
        .then((res) => {
          setUsers((prev) => ({
            items: page === 1 ? res.users : [...prev.items, ...res.users],
            page: res.page,
            totalPages: res.totalPages,
            totalCount: res.totalCount,
            isLoading: false,
          }));
        })
        .catch((err: any) => {
          setError(err.message);
          setUsers((prev) => ({ ...prev, isLoading: false }));
        });
    },
    [userSearch]
  );

  // ── Templates ──
  const fetchTemplates = useCallback(
    (page = 1) => {
      setTemplates((prev) => ({ ...prev, isLoading: true }));
      getAdminTemplates(page, 20, templateSearch)
        .then((res) => {
          setTemplates((prev) => ({
            items: page === 1 ? res.templates : [...prev.items, ...res.templates],
            page: res.page,
            totalPages: res.totalPages,
            totalCount: res.totalCount,
            isLoading: false,
          }));
        })
        .catch((err: any) => {
          setError(err.message);
          setTemplates((prev) => ({ ...prev, isLoading: false }));
        });
    },
    [templateSearch]
  );

  const removeTemplate = useCallback(
    async (id: string) => {
      try {
        await adminDeleteTemplate(id);
        setTemplates((prev) => ({
          ...prev,
          items: prev.items.filter((t) => t._id !== id),
          totalCount: prev.totalCount - 1,
        }));
        setStats((prev) =>
          prev ? { ...prev, templates: { ...prev.templates, total: prev.templates.total - 1 } } : prev
        );
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'فشل حذف القالب');
      }
    },
    []
  );

  // ── Groups ──
  const fetchGroups = useCallback((page = 1) => {
    setGroups((prev) => ({ ...prev, isLoading: true }));
    getAdminGroups(page, 20)
      .then((res) => {
        setGroups((prev) => ({
          items: page === 1 ? res.groups : [...prev.items, ...res.groups],
          page: res.page,
          totalPages: res.totalPages,
          totalCount: res.totalCount,
          isLoading: false,
        }));
      })
      .catch((err: any) => {
        setError(err.message);
        setGroups((prev) => ({ ...prev, isLoading: false }));
      });
  }, []);

  const removeGroup = useCallback(
    async (id: string) => {
      try {
        await adminDeleteGroup(id);
        setGroups((prev) => ({
          ...prev,
          items: prev.items.filter((g) => g._id !== id),
          totalCount: prev.totalCount - 1,
        }));
        setStats((prev) =>
          prev ? { ...prev, groups: { ...prev.groups, total: prev.groups.total - 1 } } : prev
        );
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'فشل حذف المجموعة');
      }
    },
    []
  );

  const clearError = useCallback(() => setError(null), []);

  return {
    stats,
    statsLoading,
    users,
    userSearch,
    setUserSearch,
    fetchUsers,
    templates,
    templateSearch,
    setTemplateSearch,
    fetchTemplates,
    removeTemplate,
    groups,
    fetchGroups,
    removeGroup,
    error,
    clearError,
  };
}
