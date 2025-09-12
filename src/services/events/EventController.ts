import { request } from '@umijs/max';

export interface EventItem {
  id?: string;
  title: string;
  date: string;
  description?: string;
}

/** Get list of events */
export async function getEvents(options?: { [key: string]: any }) {
  return request<EventItem[]>('/api/events', {
    method: 'GET',
    ...(options || {}),
  });
}

/** Get details of a single event */
export async function getEvent(
  params: { id: string },
  options?: { [key: string]: any },
) {
  const { id } = params;
  return request<EventItem>(`/api/events/${id}`, {
    method: 'GET',
    ...(options || {}),
  });
}

/** Create a new event */
export async function createEvent(
  body: EventItem,
  options?: { [key: string]: any },
) {
  return request<EventItem>('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
    ...(options || {}),
  });
}

/** Update an existing event */
export async function updateEvent(
  params: { id: string },
  body: EventItem,
  options?: { [key: string]: any },
) {
  const { id } = params;
  return request<EventItem>(`/api/events/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    data: body,
    ...(options || {}),
  });
}

/** Delete an event */
export async function deleteEvent(
  params: { id: string },
  options?: { [key: string]: any },
) {
  const { id } = params;
  return request<Record<string, any>>(`/api/events/${id}`, {
    method: 'DELETE',
    ...(options || {}),
  });
}
