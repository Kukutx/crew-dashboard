import { PlusOutlined } from '@ant-design/icons';
import type {
  ActionType,
  ProColumns,
  ProDescriptionsItemProps,
} from '@ant-design/pro-components';
import {
  FooterToolbar,
  ModalForm,
  PageContainer,
  ProDescriptions,
  ProFormDateTimeRangePicker,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import { Button, Drawer, message, Popconfirm, Space } from 'antd';
import type { ConfigType, Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import React, { useMemo, useRef, useState } from 'react';
import type {
  EventItem,
  EventListResponse,
  EventPayload,
  EventQueryParams,
  EventStatus,
  EventType,
} from '@/services/event';
import {
  createEvent,
  queryEvents,
  removeEvents,
  updateEvent,
} from '@/services/event';

type EventFormValues = {
  title: string;
  type: EventType;
  status: EventStatus;
  organizer: string;
  location: string;
  participants?: number;
  description?: string;
  dateRange?: [Dayjs, Dayjs];
};

type EventTableParams = EventQueryParams & {
  dateRange?: [string | Dayjs, string | Dayjs];
};

const eventTypeEnum: Record<EventType, { text: string }> = {
  online: { text: '线上活动' },
  offline: { text: '线下活动' },
  hybrid: { text: '线上+线下' },
};

const eventStatusEnum: Record<
  EventStatus,
  { text: string; status: 'Default' | 'Processing' | 'Success' | 'Error' }
> = {
  draft: { text: '筹备中', status: 'Default' },
  scheduled: { text: '已排期', status: 'Processing' },
  live: { text: '进行中', status: 'Success' },
  completed: { text: '已完成', status: 'Default' },
  cancelled: { text: '已取消', status: 'Error' },
};

const parseDateValue = (value: unknown) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const dateInput = value as ConfigType;
  const date = dayjs(dateInput);
  if (date.isValid()) {
    return date.toISOString();
  }

  return typeof value === 'string' ? value : undefined;
};

const normalizeEventItem = (item: Record<string, unknown>): EventItem => {
  const participantsSource =
    item.participants ??
    item.attendees ??
    item.attendeeCount ??
    item.capacity ??
    item.expectedParticipants ??
    item.registrationCount ??
    item.participantCount ??
    item.attending ??
    item.attendee_count ??
    item.registration_total ??
    item.expectedAttendees ??
    item.maxParticipants;

  const toNumber = (value: unknown) => {
    if (typeof value === 'number') {
      return value;
    }
    if (typeof value === 'string') {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : undefined;
    }
    return undefined;
  };

  const startTime =
    item.startTime ??
    item.start_time ??
    item.startAt ??
    item.start_at ??
    item.startDate ??
    item.start_date ??
    item.startDatetime ??
    item.start_datetime ??
    item.startsAt ??
    item.starts_at ??
    item.start ??
    item.beginAt ??
    item.begin_at;
  const endTime =
    item.endTime ??
    item.end_time ??
    item.endAt ??
    item.end_at ??
    item.endDate ??
    item.end_date ??
    item.endDatetime ??
    item.end_datetime ??
    item.endsAt ??
    item.ends_at ??
    item.finishAt ??
    item.finish_at ??
    item.finishDate ??
    item.finish_date ??
    item.end;

  const createdAt =
    item.createdAt ??
    item.created_at ??
    item.createdOn ??
    item.created_on ??
    item.createdDate ??
    item.created_date ??
    item.insertedAt ??
    item.inserted_at ??
    item.created;
  const updatedAt =
    item.updatedAt ??
    item.updated_at ??
    item.updatedOn ??
    item.updated_on ??
    item.updatedDate ??
    item.updated_date ??
    item.modifiedAt ??
    item.modified_at ??
    item.updated;

  const id =
    item.id ??
    item.eventId ??
    item.event_id ??
    item.uuid ??
    item._id ??
    item.slug ??
    item.code ??
    item.key ??
    `${item.title ?? item.name ?? 'event'}-${startTime ?? Date.now()}`;

  const resolvedTitle = (item.title ??
    item.name ??
    item.eventTitle ??
    item.event_name ??
    item.event) as string | undefined;

  return {
    id: String(id),
    title: resolvedTitle ?? '未命名 Event',
    type: (item.type ??
      item.category ??
      item.mode ??
      item.eventType ??
      item.event_type ??
      item.categoryName) as EventType | undefined,
    status: (item.status ??
      item.state ??
      item.lifecycle ??
      item.phase ??
      item.stage ??
      item.eventStatus ??
      item.event_status) as EventStatus | undefined,
    organizer: (item.organizer ??
      item.host ??
      item.owner ??
      item.createdBy ??
      item.organisation ??
      item.organization ??
      item.company ??
      item.organizerName ??
      item.organizedBy ??
      item.organisedBy ??
      item.hostName) as string | undefined,
    location: (item.location ??
      item.venue ??
      item.address ??
      item.city ??
      item.place ??
      item.addressLine ??
      item.cityName ??
      item.placeName ??
      item.room ??
      item.site) as string | undefined,
    participants: toNumber(participantsSource),
    startTime: parseDateValue(startTime),
    endTime: parseDateValue(endTime),
    description: (item.description ??
      item.summary ??
      item.details ??
      item.content ??
      item.notes ??
      item.remark ??
      item.longDescription ??
      item.description_long ??
      item.overview) as string | undefined,
    createdAt: parseDateValue(createdAt),
    updatedAt: parseDateValue(updatedAt),
  };
};

const extractEventList = (
  response: EventListResponse | undefined,
): EventItem[] => {
  if (!response) {
    return [];
  }

  const rawList = Array.isArray(response)
    ? response
    : (response.data ??
      response.items ??
      response.list ??
      response.events ??
      response.results ??
      response.records ??
      response.dataSource ??
      []);

  if (!Array.isArray(rawList)) {
    return [];
  }

  return rawList
    .map((item) => normalizeEventItem((item ?? {}) as Record<string, unknown>))
    .filter((event) => Boolean(event.id));
};

const resolveResponseSuccess = (response: EventListResponse | undefined) => {
  if (!response) {
    return true;
  }
  return Array.isArray(response) ? true : (response.success ?? true);
};

const resolveResponseTotal = (
  response: EventListResponse | undefined,
  fallback: number,
) => {
  if (!response) {
    return fallback;
  }
  if (Array.isArray(response)) {
    return fallback;
  }
  return (
    response.total ??
    response.meta?.total ??
    response.meta?.itemCount ??
    response.meta?.pagination?.total ??
    response.meta?.pagination?.itemCount ??
    (response.meta?.pagination?.count as number | undefined) ??
    (response.meta?.pagination?.items as number | undefined) ??
    fallback
  );
};

const buildEventPayload = (values: EventFormValues): EventPayload => {
  const [start, end] = values.dateRange || [];
  const startTime = start?.toISOString();
  const endTime = end?.toISOString();
  const participants = values.participants ?? 0;

  const basePayload: EventPayload = {
    title: values.title,
    type: values.type,
    status: values.status,
    organizer: values.organizer,
    location: values.location,
    participants,
    description: values.description,
    startTime,
    endTime,
  };

  const aliases: Record<string, unknown> = {
    name: values.title,
    host: values.organizer,
    organiser: values.organizer,
    organizerName: values.organizer,
    organiserName: values.organizer,
    organizedBy: values.organizer,
    venue: values.location,
    address: values.location,
    addressLine: values.location,
    city: values.location,
    cityName: values.location,
    placeName: values.location,
    attendeeCount: participants,
    attendees: participants,
    capacity: participants,
    registrationCount: participants,
    participantCount: participants,
    expectedParticipants: participants,
    expectedAttendees: participants,
    maxParticipants: participants,
    summary: values.description,
    details: values.description,
    longDescription: values.description,
    overview: values.description,
  };

  if (startTime) {
    aliases.start_time = startTime;
    aliases.startAt = startTime;
    aliases.start_at = startTime;
    aliases.start = startTime;
    aliases.beginAt = startTime;
    aliases.begin_at = startTime;
    aliases.begin = startTime;
  }

  if (endTime) {
    aliases.end_time = endTime;
    aliases.endAt = endTime;
    aliases.end_at = endTime;
    aliases.end = endTime;
    aliases.finishAt = endTime;
    aliases.finish_at = endTime;
    aliases.finish = endTime;
  }

  return {
    ...basePayload,
    ...aliases,
  };
};

const EventList: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [currentRow, setCurrentRow] = useState<EventItem>();
  const [selectedRowsState, setSelectedRowsState] = useState<EventItem[]>([]);

  const [messageApi, contextHolder] = message.useMessage();

  const eventTypeOptions = useMemo(
    () =>
      (Object.keys(eventTypeEnum) as EventType[]).map((key) => ({
        label: eventTypeEnum[key].text,
        value: key,
      })),
    [],
  );

  const eventStatusOptions = useMemo(
    () =>
      (Object.keys(eventStatusEnum) as EventStatus[]).map((key) => ({
        label: eventStatusEnum[key].text,
        value: key,
      })),
    [],
  );

  const handleAdd = async (values: EventFormValues) => {
    try {
      const response = await createEvent(buildEventPayload(values));
      if (response?.success === false) {
        throw new Error('create event failed');
      }
      messageApi.success('新建 Event 成功');
      actionRef.current?.reload();
      return true;
    } catch (_error) {
      messageApi.error('新建 Event 失败，请稍后重试');
      return false;
    }
  };

  const handleUpdate = async (id: string, values: EventFormValues) => {
    try {
      const response = await updateEvent({
        id,
        ...buildEventPayload(values),
      });
      if (response?.success === false) {
        throw new Error('update event failed');
      }
      messageApi.success('更新 Event 成功');
      actionRef.current?.reload();
      return true;
    } catch (_error) {
      messageApi.error('更新 Event 失败，请稍后重试');
      return false;
    }
  };

  const handleRemove = async (ids: string[]) => {
    if (!ids.length) {
      messageApi.warning('请选择要删除的 Event');
      return false;
    }
    try {
      const response = await removeEvents(ids);
      if (response?.success === false) {
        throw new Error('remove event failed');
      }
      messageApi.success('删除事件成功');
      setSelectedRowsState([]);
      actionRef.current?.reloadAndRest?.();
      return true;
    } catch (_error) {
      messageApi.error('删除事件失败，请稍后重试');
      return false;
    }
  };

  const renderFormItems = () => (
    <>
      <ProFormText
        name="title"
        label="Event 名称"
        width="md"
        placeholder="请输入 Event 名称"
        rules={[{ required: true, message: '请输入 Event 名称' }]}
      />
      <ProFormSelect
        name="type"
        label="Event 类型"
        width="md"
        options={eventTypeOptions}
        rules={[{ required: true, message: '请选择 Event 类型' }]}
      />
      <ProFormSelect
        name="status"
        label="Event 状态"
        width="md"
        options={eventStatusOptions}
        rules={[{ required: true, message: '请选择 Event 状态' }]}
      />
      <ProFormText
        name="organizer"
        label="主办方"
        width="md"
        placeholder="请输入 Event 主办方"
        rules={[{ required: true, message: '请输入 Event 主办方' }]}
      />
      <ProFormText
        name="location"
        label="Event 地点"
        width="md"
        placeholder="请输入 Event 地点"
        rules={[{ required: true, message: '请输入 Event 地点' }]}
      />
      <ProFormDigit
        name="participants"
        label="预计参与人数"
        width="sm"
        min={0}
        fieldProps={{ precision: 0 }}
      />
      <ProFormDateTimeRangePicker
        name="dateRange"
        label="Event 时间"
        width="lg"
        rules={[{ required: true, message: '请选择 Event 时间' }]}
      />
      <ProFormTextArea
        name="description"
        label="Event 简介"
        placeholder="请输入 Event 亮点、嘉宾或宣传要点"
        fieldProps={{ rows: 4 }}
      />
    </>
  );

  const columns: ProColumns<EventItem>[] = [
    {
      title: '关键字搜索',
      dataIndex: 'keyword',
      hideInTable: true,
    },
    {
      title: 'Event 名称',
      dataIndex: 'title',
      ellipsis: true,
      render: (dom, entity) => (
        <a
          onClick={() => {
            setCurrentRow(entity);
            setShowDetail(true);
          }}
        >
          {dom}
        </a>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      valueType: 'select',
      valueEnum: eventTypeEnum,
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      valueEnum: eventStatusEnum,
      width: 120,
    },
    {
      title: '主办方',
      dataIndex: 'organizer',
      width: 160,
    },
    {
      title: '地点',
      dataIndex: 'location',
      ellipsis: true,
      width: 180,
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      valueType: 'dateTime',
      hideInSearch: true,
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      valueType: 'dateTime',
      hideInSearch: true,
    },
    {
      title: 'Event 时间',
      dataIndex: 'dateRange',
      valueType: 'dateTimeRange',
      hideInTable: true,
    },
    {
      title: '预计参与',
      dataIndex: 'participants',
      valueType: 'digit',
      hideInSearch: true,
      width: 120,
    },
    {
      title: '最近更新',
      dataIndex: 'updatedAt',
      valueType: 'dateTime',
      sorter: true,
      hideInSearch: true,
    },
    {
      title: '操作',
      valueType: 'option',
      fixed: 'right',
      width: 180,
      render: (_, record) => (
        <Space size="middle">
          <a
            onClick={() => {
              setCurrentRow(record);
              setShowDetail(true);
            }}
          >
            查看详情
          </a>
          <a
            onClick={() => {
              setCurrentRow(record);
              setUpdateModalOpen(true);
            }}
          >
            编辑
          </a>
          <Popconfirm
            title="确认删除该 Event 吗？"
            onConfirm={() => handleRemove([record.id])}
          >
            <a>删除</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const descriptionColumns: ProDescriptionsItemProps<EventItem>[] = [
    {
      title: 'Event 名称',
      dataIndex: 'title',
    },
    {
      title: 'Event 类型',
      dataIndex: 'type',
      valueEnum: eventTypeEnum,
    },
    {
      title: 'Event 状态',
      dataIndex: 'status',
      valueEnum: eventStatusEnum,
    },
    {
      title: '主办方',
      dataIndex: 'organizer',
    },
    {
      title: 'Event 地点',
      dataIndex: 'location',
    },
    {
      title: '预计参与人数',
      dataIndex: 'participants',
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      valueType: 'dateTime',
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      valueType: 'dateTime',
    },
    {
      title: 'Event 简介',
      dataIndex: 'description',
      valueType: 'textarea',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
    },
    {
      title: '最近更新',
      dataIndex: 'updatedAt',
      valueType: 'dateTime',
    },
  ];

  const updateInitialValues = currentRow
    ? {
        ...currentRow,
        dateRange:
          currentRow.startTime && currentRow.endTime
            ? [dayjs(currentRow.startTime), dayjs(currentRow.endTime)]
            : undefined,
      }
    : undefined;

  return (
    <PageContainer>
      {contextHolder}
      <ProTable<EventItem, EventTableParams>
        headerTitle="Event 列表"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 96,
        }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="create"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalOpen(true)}
          >
            新建 Event
          </Button>,
        ]}
        request={async (params, sorter) => {
          const { dateRange, ...rest } = params;
          const query: EventQueryParams = {
            ...rest,
            sorter:
              sorter && Object.keys(sorter).length
                ? JSON.stringify(sorter)
                : undefined,
          };

          if (Array.isArray(dateRange) && dateRange.length === 2) {
            const [start, end] = dateRange;
            query.startTime = dayjs(start).toISOString();
            query.endTime = dayjs(end).toISOString();
          }

          const response = await queryEvents(query);
          const dataSource = extractEventList(response);

          return {
            data: dataSource,
            success: resolveResponseSuccess(response),
            total: resolveResponseTotal(response, dataSource.length),
          };
        }}
        columns={columns}
        pagination={{
          showSizeChanger: true,
        }}
        rowSelection={{
          onChange: (_, selectedRows) => setSelectedRowsState(selectedRows),
        }}
      />

      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              已选择{' '}
              <a style={{ fontWeight: 600 }}>{selectedRowsState.length}</a> 项
            </div>
          }
        >
          <Button
            danger
            onClick={() =>
              handleRemove(selectedRowsState.map((item) => item.id))
            }
          >
            批量删除
          </Button>
        </FooterToolbar>
      )}

      <ModalForm<EventFormValues>
        title="新建 Event"
        width={520}
        modalProps={{
          destroyOnClose: true,
          onCancel: () => setCreateModalOpen(false),
        }}
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        initialValues={{
          status: 'draft',
          type: 'online',
        }}
        onFinish={async (values) => {
          const success = await handleAdd(values);
          if (success) {
            setCreateModalOpen(false);
          }
          return success;
        }}
      >
        {renderFormItems()}
      </ModalForm>

      <ModalForm<EventFormValues>
        key={currentRow?.id || 'update'}
        title="编辑 Event"
        width={520}
        modalProps={{
          destroyOnClose: true,
          onCancel: () => {
            setUpdateModalOpen(false);
            setCurrentRow(undefined);
          },
        }}
        open={updateModalOpen}
        onOpenChange={(open) => {
          setUpdateModalOpen(open);
          if (!open) {
            setCurrentRow(undefined);
          }
        }}
        initialValues={updateInitialValues}
        onFinish={async (values) => {
          if (!currentRow) {
            return false;
          }
          const success = await handleUpdate(currentRow.id, values);
          if (success) {
            setUpdateModalOpen(false);
            setCurrentRow(undefined);
          }
          return success;
        }}
      >
        {renderFormItems()}
      </ModalForm>

      <Drawer
        width={520}
        open={showDetail}
        onClose={() => {
          setShowDetail(false);
          setCurrentRow(undefined);
        }}
        closable
        destroyOnClose
        title={
          currentRow?.title ? `${currentRow.title} - Event 详情` : 'Event 详情'
        }
      >
        {currentRow && (
          <ProDescriptions<EventItem>
            column={1}
            title={false}
            dataSource={currentRow}
            columns={descriptionColumns}
          />
        )}
      </Drawer>
    </PageContainer>
  );
};

export default EventList;
