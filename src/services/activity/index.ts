import { request } from '@umijs/max';

export type ActivityType = 'online' | 'offline' | 'hybrid';
export type ActivityStatus =
  | 'draft'
  | 'scheduled'
  | 'live'
  | 'completed'
  | 'cancelled';

export interface ActivityItem {
  id: string;
  title: string;
  type: ActivityType;
  status: ActivityStatus;
  organizer: string;
  location: string;
  participants: number;
  startTime: string;
  endTime: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityList {
  data?: ActivityItem[];
  success?: boolean;
  total?: number;
}

export interface ActivityQueryParams extends API.PageParams {
  keyword?: string;
  type?: ActivityType;
  status?: ActivityStatus;
  startTime?: string;
  endTime?: string;
  sorter?: string;
}

export type ActivityPayload = Partial<ActivityItem> & {
  id?: string;
  ids?: string[];
};

export async function queryActivities(params?: ActivityQueryParams) {
  return request<ActivityList>('/api/activities', {
    method: 'GET',
    params,
  });
}

export async function createActivity(data: ActivityPayload) {
  return request<{ success: boolean; data?: ActivityItem }>(
    '/api/activities',
    {
      method: 'POST',
      data: {
        method: 'post',
        ...data,
      },
    },
  );
}

export async function updateActivity(data: ActivityPayload & { id: string }) {
  return request<{ success: boolean; data?: ActivityItem }>(
    '/api/activities',
    {
      method: 'POST',
      data: {
        method: 'update',
        ...data,
      },
    },
  );
}

export async function removeActivities(ids: string[]) {
  return request<{ success: boolean }>('/api/activities', {
    method: 'POST',
    data: {
      method: 'delete',
      ids,
    },
  });
}

