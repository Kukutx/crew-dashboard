import {
  PageContainer,
  type ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import { Badge, Button, Card, Space, Tag, Typography } from 'antd';
import React, { useMemo } from 'react';

type FeedbackStatus =
  | 'new'
  | 'reviewing'
  | 'processing'
  | 'resolved'
  | 'closed';

type FeedbackPriority = 'low' | 'medium' | 'high';

type FeedbackChannel = 'web' | 'app' | 'email' | 'offline';

type FeedbackItem = {
  id: string;
  title: string;
  user: string;
  department: string;
  channel: FeedbackChannel;
  priority: FeedbackPriority;
  status: FeedbackStatus;
  submittedAt: string;
  updatedAt: string;
  owner: string;
  tags?: string[];
  description: string;
};

const feedbackData: FeedbackItem[] = [
  {
    id: 'FB-202501',
    title: '移动端排班表在夜间模式下显示异常',
    user: '张敏',
    department: '航线运营部',
    channel: 'app',
    priority: 'high',
    status: 'processing',
    submittedAt: '2025-01-18 09:12',
    updatedAt: '2025-01-19 15:24',
    owner: '李晓',
    tags: ['排班', 'UI'],
    description: '夜间模式下排班表背景色过暗，导致文字不可辨认，需要紧急修复。',
  },
  {
    id: 'FB-202502',
    title: '新增航班通知频率过高',
    user: '王磊',
    department: '乘务支持组',
    channel: 'web',
    priority: 'medium',
    status: 'reviewing',
    submittedAt: '2025-01-17 14:30',
    updatedAt: '2025-01-18 10:02',
    owner: '孙倩',
    tags: ['消息', '体验优化'],
    description: '建议将航班变更通知进行合并推送，避免重复提醒造成干扰。',
  },
  {
    id: 'FB-202503',
    title: '历史反馈查询需支持导出',
    user: '刘凯',
    department: '综合保障部',
    channel: 'email',
    priority: 'low',
    status: 'resolved',
    submittedAt: '2025-01-12 08:45',
    updatedAt: '2025-01-16 19:40',
    owner: '何静',
    tags: ['报表'],
    description: '希望历史反馈可以导出为 Excel 文件，便于周会汇报使用。',
  },
  {
    id: 'FB-202504',
    title: '乘务指南文档存在旧版本',
    user: '赵蓉',
    department: '培训管理部',
    channel: 'offline',
    priority: 'medium',
    status: 'new',
    submittedAt: '2025-01-20 11:20',
    updatedAt: '2025-01-20 11:20',
    owner: '待分配',
    tags: ['知识库'],
    description: '线下培训资料中的乘务指南未同步最新流程，请安排更新。',
  },
  {
    id: 'FB-202505',
    title: '改签流程提示语需要多语言',
    user: '陈蕾',
    department: '国际航班服务部',
    channel: 'web',
    priority: 'high',
    status: 'processing',
    submittedAt: '2025-01-10 16:05',
    updatedAt: '2025-01-19 09:30',
    owner: '李晓',
    tags: ['国际化', '流程'],
    description: '建议在改签流程中增加英语与日语提示，方便国际乘务查看。',
  },
];

const FeedbackManagementPage: React.FC = () => {
  const statusValueEnum = useMemo(
    () => ({
      new: { text: '待分配', status: 'Default' as const },
      reviewing: { text: '审核中', status: 'Processing' as const },
      processing: { text: '处理中', status: 'Processing' as const },
      resolved: { text: '已解决', status: 'Success' as const },
      closed: { text: '已关闭', status: 'Default' as const },
    }),
    [],
  );

  const priorityValueEnum = useMemo(
    () => ({
      low: { text: '低', status: 'Default' as const },
      medium: { text: '中', status: 'Warning' as const },
      high: { text: '高', status: 'Error' as const },
    }),
    [],
  );

  const channelValueEnum = useMemo(
    () => ({
      web: { text: 'Web 提交' },
      app: { text: '移动端' },
      email: { text: '邮件' },
      offline: { text: '线下收集' },
    }),
    [],
  );

  const columns: ProColumns<FeedbackItem>[] = [
    {
      title: '反馈编号',
      dataIndex: 'id',
      copyable: true,
      width: 120,
    },
    {
      title: '主题',
      dataIndex: 'title',
      ellipsis: true,
      width: 220,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text strong>{record.title}</Typography.Text>
          <Typography.Text type="secondary" ellipsis>
            {record.description}
          </Typography.Text>
        </Space>
      ),
    },
    {
      title: '提交人',
      dataIndex: 'user',
      width: 120,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text>{record.user}</Typography.Text>
          <Typography.Text type="secondary">
            {record.department}
          </Typography.Text>
        </Space>
      ),
    },
    {
      title: '渠道',
      dataIndex: 'channel',
      filters: true,
      onFilter: true,
      valueEnum: channelValueEnum,
      width: 120,
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      valueEnum: priorityValueEnum,
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueEnum: statusValueEnum,
      width: 120,
    },
    {
      title: '当前处理人',
      dataIndex: 'owner',
      width: 120,
      render: (_, record) => {
        const status:
          | 'default'
          | 'processing'
          | 'success'
          | 'warning'
          | 'error' =
          record.status === 'resolved'
            ? 'success'
            : record.status === 'closed'
              ? 'default'
              : record.status === 'reviewing'
                ? 'warning'
                : 'processing';
        return (
          <Space size={6}>
            <Badge status={status} />
            <span>{record.owner}</span>
          </Space>
        );
      },
    },
    {
      title: '标签',
      dataIndex: 'tags',
      width: 160,
      render: (_, record) => (
        <Space size={[4, 8]} wrap>
          {(record.tags ?? []).map((tag) => (
            <Tag color="blue" key={tag}>
              {tag}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '提交时间',
      dataIndex: 'submittedAt',
      sorter: (a, b) =>
        new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime(),
      width: 180,
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      sorter: (a, b) =>
        new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
      width: 180,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 140,
      render: () => [
        <a key="view">查看详情</a>,
        <a key="assign">指派</a>,
        <a key="close">关闭</a>,
      ],
    },
  ];

  return (
    <PageContainer
      header={{
        title: '反馈管理',
        subTitle: '集中跟踪乘务队反馈事项，帮助运营团队快速闭环处理。',
      }}
    >
      <Card
        style={{ marginBottom: 24 }}
        title="工作提示"
        bordered={false}
        bodyStyle={{ paddingBottom: 12 }}
      >
        <Typography.Paragraph>
          • 每日 9:00 前请完成新反馈的分配，并在跟进完成后更新处理状态。
        </Typography.Paragraph>
        <Typography.Paragraph>
          • 重要反馈需在 48 小时内给予初步响应，处理完成后可同步经验至知识库。
        </Typography.Paragraph>
      </Card>
      <ProTable<FeedbackItem>
        rowKey="id"
        search={{
          labelWidth: 'auto',
        }}
        columns={columns}
        dataSource={feedbackData}
        pagination={{
          pageSize: 5,
          showSizeChanger: false,
        }}
        toolBarRender={() => [
          <Button key="new" type="primary">
            新建反馈
          </Button>,
        ]}
      />
    </PageContainer>
  );
};

export default FeedbackManagementPage;
