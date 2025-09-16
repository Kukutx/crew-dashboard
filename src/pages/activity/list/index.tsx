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
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import React, { useMemo, useRef, useState } from 'react';
import type {
  ActivityItem,
  ActivityQueryParams,
  ActivityStatus,
  ActivityType,
} from '@/services/activity';
import {
  createActivity,
  queryActivities,
  removeActivities,
  updateActivity,
} from '@/services/activity';

type ActivityFormValues = {
  title: string;
  type: ActivityType;
  status: ActivityStatus;
  organizer: string;
  location: string;
  participants?: number;
  description?: string;
  dateRange?: [Dayjs, Dayjs];
};

type ActivityTableParams = ActivityQueryParams & {
  dateRange?: [string | Dayjs, string | Dayjs];
};

const activityTypeEnum: Record<ActivityType, { text: string }> = {
  online: { text: '线上活动' },
  offline: { text: '线下活动' },
  hybrid: { text: '线上+线下' },
};

const activityStatusEnum: Record<
  ActivityStatus,
  { text: string; status: 'Default' | 'Processing' | 'Success' | 'Error' }
> = {
  draft: { text: '筹备中', status: 'Default' },
  scheduled: { text: '已排期', status: 'Processing' },
  live: { text: '进行中', status: 'Success' },
  completed: { text: '已完成', status: 'Default' },
  cancelled: { text: '已取消', status: 'Error' },
};

const ActivityList: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [currentRow, setCurrentRow] = useState<ActivityItem>();
  const [selectedRowsState, setSelectedRowsState] = useState<ActivityItem[]>(
    [],
  );

  const [messageApi, contextHolder] = message.useMessage();

  const activityTypeOptions = useMemo(
    () =>
      (Object.keys(activityTypeEnum) as ActivityType[]).map((key) => ({
        label: activityTypeEnum[key].text,
        value: key,
      })),
    [],
  );

  const activityStatusOptions = useMemo(
    () =>
      (Object.keys(activityStatusEnum) as ActivityStatus[]).map((key) => ({
        label: activityStatusEnum[key].text,
        value: key,
      })),
    [],
  );

  const handleAdd = async (values: ActivityFormValues) => {
    const [start, end] = values.dateRange || [];
    try {
      const response = await createActivity({
        ...values,
        participants: values.participants ?? 0,
        startTime: start?.toISOString(),
        endTime: end?.toISOString(),
      });
      if (response?.success === false) {
        throw new Error('create activity failed');
      }
      messageApi.success('新建活动成功');
      actionRef.current?.reload();
      return true;
    } catch (_error) {
      messageApi.error('新建活动失败，请稍后重试');
      return false;
    }
  };

  const handleUpdate = async (id: string, values: ActivityFormValues) => {
    const [start, end] = values.dateRange || [];
    try {
      const response = await updateActivity({
        id,
        ...values,
        participants: values.participants ?? 0,
        startTime: start?.toISOString(),
        endTime: end?.toISOString(),
      });
      if (response?.success === false) {
        throw new Error('update activity failed');
      }
      messageApi.success('更新活动成功');
      actionRef.current?.reload();
      return true;
    } catch (_error) {
      messageApi.error('更新活动失败，请稍后重试');
      return false;
    }
  };

  const handleRemove = async (ids: string[]) => {
    if (!ids.length) {
      messageApi.warning('请选择要删除的活动');
      return false;
    }
    try {
      const response = await removeActivities(ids);
      if (response?.success === false) {
        throw new Error('remove activity failed');
      }
      messageApi.success('删除成功');
      setSelectedRowsState([]);
      actionRef.current?.reloadAndRest?.();
      return true;
    } catch (_error) {
      messageApi.error('删除失败，请稍后重试');
      return false;
    }
  };

  const renderFormItems = () => (
    <>
      <ProFormText
        name="title"
        label="活动名称"
        width="md"
        placeholder="请输入活动名称"
        rules={[{ required: true, message: '请输入活动名称' }]}
      />
      <ProFormSelect
        name="type"
        label="活动类型"
        width="md"
        options={activityTypeOptions}
        rules={[{ required: true, message: '请选择活动类型' }]}
      />
      <ProFormSelect
        name="status"
        label="活动状态"
        width="md"
        options={activityStatusOptions}
        rules={[{ required: true, message: '请选择活动状态' }]}
      />
      <ProFormText
        name="organizer"
        label="主办方"
        width="md"
        placeholder="请输入活动主办方"
        rules={[{ required: true, message: '请输入活动主办方' }]}
      />
      <ProFormText
        name="location"
        label="活动地点"
        width="md"
        placeholder="请输入活动地点"
        rules={[{ required: true, message: '请输入活动地点' }]}
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
        label="活动时间"
        width="lg"
        rules={[{ required: true, message: '请选择活动时间' }]}
      />
      <ProFormTextArea
        name="description"
        label="活动简介"
        placeholder="请输入活动亮点、嘉宾或宣传要点"
        fieldProps={{ rows: 4 }}
      />
    </>
  );

  const columns: ProColumns<ActivityItem>[] = [
    {
      title: '关键字搜索',
      dataIndex: 'keyword',
      hideInTable: true,
    },
    {
      title: '活动名称',
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
      valueEnum: activityTypeEnum,
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      valueEnum: activityStatusEnum,
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
      title: '活动时间',
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
            title="确认删除该活动吗？"
            onConfirm={() => handleRemove([record.id])}
          >
            <a>删除</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const descriptionColumns: ProDescriptionsItemProps<ActivityItem>[] = [
    {
      title: '活动名称',
      dataIndex: 'title',
    },
    {
      title: '活动类型',
      dataIndex: 'type',
      valueEnum: activityTypeEnum,
    },
    {
      title: '活动状态',
      dataIndex: 'status',
      valueEnum: activityStatusEnum,
    },
    {
      title: '主办方',
      dataIndex: 'organizer',
    },
    {
      title: '活动地点',
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
      title: '活动简介',
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
      <ProTable<ActivityItem, ActivityTableParams>
        headerTitle="活动列表"
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
            新建活动
          </Button>,
        ]}
        request={async (params, sorter) => {
          const { dateRange, ...rest } = params;
          const query: ActivityQueryParams = {
            ...rest,
            sorter:
              sorter && Object.keys(sorter).length
                ? JSON.stringify(sorter)
                : undefined,
          };

          if (Array.isArray(dateRange) && dateRange.length === 2) {
            query.startTime = dayjs(dateRange[0]).toISOString();
            query.endTime = dayjs(dateRange[1]).toISOString();
          }

          const response = await queryActivities(query);
          return {
            data: response.data ?? [],
            success: response.success ?? true,
            total: response.total ?? 0,
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

      <ModalForm<ActivityFormValues>
        title="新建活动"
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

      <ModalForm<ActivityFormValues>
        key={currentRow?.id || 'update'}
        title="编辑活动"
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
          currentRow?.title ? `${currentRow.title} - 活动详情` : '活动详情'
        }
      >
        {currentRow && (
          <ProDescriptions<ActivityItem>
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

export default ActivityList;
