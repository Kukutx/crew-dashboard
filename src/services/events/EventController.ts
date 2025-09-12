import { API_BASE_URL } from '@/constants';
import { request } from '@umijs/max';

export interface EventItem {
  id?: string;
  title: string;
  date: string;
  description?: string;
}

/** Base endpoint for events in Crew API */
const EVENTS_URL = `${API_BASE_URL}/api/Events`;

/** Get list of events */
export async function getEvents(options?: { [key: string]: any }) {
  return request<EventItem[]>(EVENTS_URL, {
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
  return request<EventItem>(`${EVENTS_URL}/${id}`, {
    method: 'GET',
    ...(options || {}),
  });
}

/** Create a new event */
export async function createEvent(
  body: EventItem,
  options?: { [key: string]: any },
) {
  return request<EventItem>(EVENTS_URL, {
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
  return request<EventItem>(`${EVENTS_URL}/${id}`, {
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
  return request<Record<string, any>>(`${EVENTS_URL}/${id}`, {
    method: 'DELETE',
    ...(options || {}),
  });
}
