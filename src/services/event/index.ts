import { request } from '@umijs/max';

export type EventType = 'online' | 'offline' | 'hybrid' | (string & {});
export type EventStatus =
  | 'draft'
  | 'scheduled'
  | 'live'
  | 'completed'
  | 'cancelled'
  | (string & {});

export interface EventItem {
  id: string;
  title: string;
  type?: EventType;
  status?: EventStatus;
  organizer?: string;
  location?: string;
  participants?: number;
  startTime?: string;
  endTime?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface EventListMeta {
  total?: number;
  itemCount?: number;
  pagination?: {
    total?: number;
    itemCount?: number;
    count?: number;
    items?: number;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export type EventListResponse =
  | EventItem[]
  | {
      data?: EventItem[];
      items?: EventItem[];
      list?: EventItem[];
      events?: EventItem[];
      results?: EventItem[];
      records?: EventItem[];
      dataSource?: EventItem[];
      meta?: EventListMeta;
      total?: number;
      success?: boolean;
      [key: string]: unknown;
    };

export interface EventQueryParams extends API.PageParams {
  keyword?: string;
  type?: EventType;
  status?: EventStatus;
  startTime?: string;
  endTime?: string;
  sorter?: string;
}

export type EventPayload = Partial<EventItem> & {
  ids?: string[];
};

export interface EventMutationResponse {
  success?: boolean;
  data?: EventItem;
  message?: string;
  [key: string]: unknown;
}

const EVENT_API_BASE_URL = 'https://crew-api-u8vu.onrender.com/api/events';

export async function queryEvents(params?: EventQueryParams) {
  return request<EventListResponse>(EVENT_API_BASE_URL, {
    method: 'GET',
    params,
  });
}

export async function createEvent(data: EventPayload) {
  return request<EventMutationResponse>(EVENT_API_BASE_URL, {
    method: 'POST',
    data,
  });
}

export async function updateEvent({ id, ...data }: EventPayload & { id: string }) {
  return request<EventMutationResponse>(`${EVENT_API_BASE_URL}/${id}`, {
    method: 'PUT',
    data,
  });
}

export async function removeEvents(ids: string[]) {
  if (!ids.length) {
    return { success: true } as EventMutationResponse;
  }

  const results = await Promise.all(
    ids.map((id) =>
      request<EventMutationResponse>(`${EVENT_API_BASE_URL}/${id}`, {
        method: 'DELETE',
      }),
    ),
  );

  const hasFailure = results.some((result) => result?.success === false);

  return {
    success: !hasFailure,
  } as EventMutationResponse;
}
