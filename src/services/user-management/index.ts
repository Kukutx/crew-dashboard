import { request } from '@umijs/max';

export type UserRole = 'admin' | 'manager' | 'editor' | 'viewer';
export type UserStatus = 'active' | 'pending' | 'suspended';

export interface ManagedUserItem {
  id: string;
  name: string;
  email: string;
  phone?: string;
  department?: string;
  role: UserRole;
  status: UserStatus;
  lastLogin?: string;
  createdAt: string;
  notes?: string;
}

export interface ManagedUserList {
  data?: ManagedUserItem[];
  success?: boolean;
  total?: number;
}

export interface ManagedUserQueryParams extends API.PageParams {
  keyword?: string;
  role?: UserRole;
  status?: UserStatus;
  sorter?: string;
}

export type ManagedUserPayload = Partial<ManagedUserItem> & {
  id?: string;
  ids?: string[];
};

export async function queryManagedUsers(params?: ManagedUserQueryParams) {
  return request<ManagedUserList>('/api/managed-users', {
    method: 'GET',
    params,
  });
}

export async function createManagedUser(data: ManagedUserPayload) {
  return request<{ success: boolean; data?: ManagedUserItem }>(
    '/api/managed-users',
    {
      method: 'POST',
      data: {
        method: 'post',
        ...data,
      },
    },
  );
}

export async function updateManagedUser(
  data: ManagedUserPayload & { id: string },
) {
  return request<{ success: boolean; data?: ManagedUserItem }>(
    '/api/managed-users',
    {
      method: 'POST',
      data: {
        method: 'update',
        ...data,
      },
    },
  );
}

export async function removeManagedUsers(ids: string[]) {
  return request<{ success: boolean }>('/api/managed-users', {
    method: 'POST',
    data: {
      method: 'delete',
      ids,
    },
  });
}

