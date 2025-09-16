import { parse } from 'node:url';
import dayjs from 'dayjs';
import type { Request, Response } from 'express';

type ActivityItem = {
  id: string;
  title: string;
  type: 'online' | 'offline' | 'hybrid';
  status: 'draft' | 'scheduled' | 'live' | 'completed' | 'cancelled';
  organizer: string;
  location: string;
  participants: number;
  startTime: string;
  endTime: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
};

const activityTypes: ActivityItem['type'][] = ['online', 'offline', 'hybrid'];
const activityStatuses: ActivityItem['status'][] = [
  'draft',
  'scheduled',
  'live',
  'completed',
  'cancelled',
];

const generateActivities = (count: number): ActivityItem[] => {
  return Array.from({ length: count }).map((_, index) => {
    const baseDate = dayjs().add(index, 'day');
    const startTime = baseDate.hour(9).minute(0).second(0);
    const endTime = startTime.add(2 + (index % 3), 'hour');
    return {
      id: `${index + 1}`,
      title: `活动策划会 ${index + 1}`,
      type: activityTypes[index % activityTypes.length],
      status: activityStatuses[index % activityStatuses.length],
      organizer: ['市场部', '品牌组', '活动组', '产品部'][index % 4],
      location: ['线上直播间', '上海虹桥会议中心', '深圳科创园', '北京总部'][
        index % 4
      ],
      participants: 20 + (index % 5) * 15,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      description: `这是第 ${index + 1} 场活动的筹备详情，包含议程、嘉宾和宣传重点。`,
      createdAt: baseDate.subtract(3, 'day').toISOString(),
      updatedAt: baseDate.subtract(1, 'day').toISOString(),
    };
  });
};

let activities: ActivityItem[] = generateActivities(24);

const filterActivities = (
  data: ActivityItem[],
  query: Partial<ActivityItem> &
    API.PageParams & {
      keyword?: string;
      startTime?: string;
      endTime?: string;
      sorter?: string;
    },
) => {
  let result = [...data];

  if (query.keyword) {
    const keyword = query.keyword.toLowerCase();
    result = result.filter(
      (item) =>
        item.title.toLowerCase().includes(keyword) ||
        item.organizer.toLowerCase().includes(keyword) ||
        item.location.toLowerCase().includes(keyword),
    );
  }

  if (query.status) {
    result = result.filter((item) => item.status === query.status);
  }

  if (query.type) {
    result = result.filter((item) => item.type === query.type);
  }

  if (query.startTime && query.endTime) {
    const start = dayjs(query.startTime);
    const end = dayjs(query.endTime);
    result = result.filter((item) => {
      const itemStart = dayjs(item.startTime);
      return itemStart.isAfter(start.subtract(1, 'millisecond')) && itemStart.isBefore(end.add(1, 'millisecond'));
    });
  }

  if (query.sorter) {
    try {
      const sorter = JSON.parse(query.sorter) as Record<
        keyof ActivityItem,
        'ascend' | 'descend'
      >;
      const entries = Object.entries(sorter) as Array<
        [keyof ActivityItem, 'ascend' | 'descend']
      >;
      const [sortKey, sortOrder] = entries[0] ?? [];
      if (sortKey && sortOrder) {
        result = result.sort((a, b) => {
          const valueA = a[sortKey];
          const valueB = b[sortKey];
          if (
            typeof valueA === 'string' &&
            typeof valueB === 'string' &&
            dayjs(valueA).isValid() &&
            dayjs(valueB).isValid()
          ) {
            const dateA = dayjs(valueA).valueOf();
            const dateB = dayjs(valueB).valueOf();
            return sortOrder === 'ascend' ? dateA - dateB : dateB - dateA;
          }
          if (typeof valueA === 'number' && typeof valueB === 'number') {
            return sortOrder === 'ascend'
              ? valueA - valueB
              : valueB - valueA;
          }
          return sortOrder === 'ascend'
            ? `${valueA}`.localeCompare(`${valueB}`)
            : `${valueB}`.localeCompare(`${valueA}`);
        });
      }
    } catch (_error) {
      // ignore parse error
    }
  }

  return result;
};

const getActivities = (req: Request, res: Response, u?: string) => {
  let realUrl = u;
  if (!realUrl || Object.prototype.toString.call(realUrl) !== '[object String]') {
    realUrl = req.url;
  }

  const { current = 1, pageSize = 10 } = req.query;
  const params = parse(realUrl, true).query as unknown as ActivityItem &
    API.PageParams & {
      keyword?: string;
      startTime?: string;
      endTime?: string;
      sorter?: string;
    };

  const filtered = filterActivities(activities, params);
  const page = Number(current) || 1;
  const size = Number(pageSize) || 10;
  const data = filtered.slice((page - 1) * size, page * size);

  return res.json({
    data,
    total: filtered.length,
    success: true,
    pageSize: size,
    current: page,
  });
};

const postActivities = (req: Request, res: Response) => {
  const body = req.body as {
    method: 'post' | 'update' | 'delete';
    id?: string;
    ids?: string[];
    [key: string]: any;
  };

  switch (body.method) {
    case 'post': {
      const id = `${Date.now()}`;
      const now = dayjs().toISOString();
      const newActivity: ActivityItem = {
        id,
        title: body.title,
        type: body.type || 'online',
        status: body.status || 'draft',
        organizer: body.organizer || '未指定',
        location: body.location || '待定',
        participants: body.participants ? Number(body.participants) : 0,
        startTime: body.startTime || now,
        endTime: body.endTime || dayjs(now).add(2, 'hour').toISOString(),
        description: body.description,
        createdAt: now,
        updatedAt: now,
      };
      activities = [newActivity, ...activities];
      return res.json({ success: true, data: newActivity });
    }
    case 'update': {
      const { id } = body;
      if (!id) {
        return res.status(400).json({ success: false, message: '缺少活动 ID' });
      }
      let updatedActivity: ActivityItem | undefined;
      activities = activities.map((item) => {
        if (item.id === id) {
          updatedActivity = {
            ...item,
            ...body,
            participants: body.participants
              ? Number(body.participants)
              : item.participants,
            startTime: body.startTime || item.startTime,
            endTime: body.endTime || item.endTime,
            updatedAt: dayjs().toISOString(),
          };
          return updatedActivity;
        }
        return item;
      });
      return res.json({ success: true, data: updatedActivity });
    }
    case 'delete': {
      const ids: string[] = Array.isArray(body.ids)
        ? body.ids
        : body.id
          ? [body.id]
          : [];
      activities = activities.filter((item) => !ids.includes(item.id));
      return res.json({ success: true });
    }
    default:
      break;
  }

  return res.json({ success: true });
};

export default {
  'GET /api/activities': getActivities,
  'POST /api/activities': postActivities,
};

