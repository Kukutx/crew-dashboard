import { parse } from 'node:url';
import dayjs from 'dayjs';
import type { Request, Response } from 'express';

type ManagedUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  department?: string;
  role: 'admin' | 'manager' | 'editor' | 'viewer';
  status: 'active' | 'pending' | 'suspended';
  lastLogin?: string;
  createdAt: string;
  notes?: string;
};

const roleOptions: ManagedUser['role'][] = ['admin', 'manager', 'editor', 'viewer'];
const statusOptions: ManagedUser['status'][] = ['active', 'pending', 'suspended'];
const departments = ['综合管理部', '市场营销部', '产品研发部', '客户成功部'];

const generateUsers = (count: number): ManagedUser[] => {
  return Array.from({ length: count }).map((_, index) => {
    const now = dayjs().subtract(index, 'day');
    return {
      id: `${index + 1}`,
      name: `用户 ${index + 1}`,
      email: `user${index + 1}@example.com`,
      phone: `1380000${String(index).padStart(4, '0')}`,
      department: departments[index % departments.length],
      role: roleOptions[index % roleOptions.length],
      status: statusOptions[index % statusOptions.length],
      lastLogin: now.subtract(index % 5, 'hour').toISOString(),
      createdAt: now.subtract(7, 'day').toISOString(),
      notes: index % 2 === 0 ? '重点客户维护对象。' : '可安排参与活动支持。',
    };
  });
};

let managedUsers: ManagedUser[] = generateUsers(36);

const getManagedUsers = (req: Request, res: Response, u?: string) => {
  let realUrl = u;
  if (!realUrl || Object.prototype.toString.call(realUrl) !== '[object String]') {
    realUrl = req.url;
  }

  const params = parse(realUrl, true).query as unknown as ManagedUser &
    API.PageParams & {
      keyword?: string;
      sorter?: string;
    };

  const { current = 1, pageSize = 10, keyword, status, role } = params;

  let data = [...managedUsers];

  if (keyword) {
    const lowerKeyword = keyword.toLowerCase();
    data = data.filter(
      (item) =>
        item.name.toLowerCase().includes(lowerKeyword) ||
        item.email.toLowerCase().includes(lowerKeyword) ||
        (item.department || '').toLowerCase().includes(lowerKeyword) ||
        (item.phone || '').toLowerCase().includes(lowerKeyword),
    );
  }

  if (status) {
    data = data.filter((item) => item.status === status);
  }

  if (role) {
    data = data.filter((item) => item.role === role);
  }

  if (params.sorter) {
    try {
      const sorter = JSON.parse(params.sorter) as Record<
        keyof ManagedUser,
        'ascend' | 'descend'
      >;
      const entries = Object.entries(sorter) as Array<
        [keyof ManagedUser, 'ascend' | 'descend']
      >;
      const [sortKey, sortOrder] = entries[0] ?? [];
      if (sortKey && sortOrder) {
        data = data.sort((a, b) => {
          const valueA = a[sortKey];
          const valueB = b[sortKey];
          if (typeof valueA === 'undefined' || typeof valueB === 'undefined') {
            return 0;
          }
          if (dayjs(valueA as string).isValid() && dayjs(valueB as string).isValid()) {
            const timeA = dayjs(valueA as string).valueOf();
            const timeB = dayjs(valueB as string).valueOf();
            return sortOrder === 'ascend' ? timeA - timeB : timeB - timeA;
          }
          if (typeof valueA === 'string' && typeof valueB === 'string') {
            return sortOrder === 'ascend'
              ? valueA.localeCompare(valueB)
              : valueB.localeCompare(valueA);
          }
          return 0;
        });
      }
    } catch (_error) {
      // ignore parse error
    }
  }

  const page = Number(current) || 1;
  const size = Number(pageSize) || 10;
  const pageData = data.slice((page - 1) * size, page * size);

  return res.json({
    data: pageData,
    total: data.length,
    success: true,
    pageSize: size,
    current: page,
  });
};

const postManagedUsers = (req: Request, res: Response) => {
  const body = req.body as {
    method: 'post' | 'update' | 'delete';
    id?: string;
    ids?: string[];
    [key: string]: any;
  };

  switch (body.method) {
    case 'post': {
      const now = dayjs().toISOString();
      const newUser: ManagedUser = {
        id: `${Date.now()}`,
        name: body.name,
        email: body.email,
        phone: body.phone,
        department: body.department,
        role: body.role || 'viewer',
        status: body.status || 'pending',
        notes: body.notes,
        lastLogin: body.lastLogin || now,
        createdAt: now,
      };
      managedUsers = [newUser, ...managedUsers];
      return res.json({ success: true, data: newUser });
    }
    case 'update': {
      const { id } = body;
      if (!id) {
        return res.status(400).json({ success: false, message: '缺少用户 ID' });
      }
      let updatedUser: ManagedUser | undefined;
      managedUsers = managedUsers.map((item) => {
        if (item.id === id) {
          updatedUser = {
            ...item,
            ...body,
            role: body.role || item.role,
            status: body.status || item.status,
            lastLogin: body.lastLogin || item.lastLogin,
          };
          return updatedUser;
        }
        return item;
      });
      return res.json({ success: true, data: updatedUser });
    }
    case 'delete': {
      const ids: string[] = Array.isArray(body.ids)
        ? body.ids
        : body.id
          ? [body.id]
          : [];
      managedUsers = managedUsers.filter((item) => !ids.includes(item.id));
      return res.json({ success: true });
    }
    default:
      break;
  }

  return res.json({ success: true });
};

export default {
  'GET /api/managed-users': getManagedUsers,
  'POST /api/managed-users': postManagedUsers,
};

