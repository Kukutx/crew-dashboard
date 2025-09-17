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
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import { Button, Drawer, message, Popconfirm, Space } from 'antd';
import React, { useMemo, useRef, useState } from 'react';
import type {
  ManagedUserItem,
  ManagedUserQueryParams,
  UserRole,
  UserStatus,
} from '@/services/user-management';
import {
  createManagedUser,
  queryManagedUsers,
  removeManagedUsers,
  updateManagedUser,
} from '@/services/user-management';

type UserFormValues = {
  name: string;
  email: string;
  phone?: string;
  department?: string;
  role: UserRole;
  status: UserStatus;
  notes?: string;
};

const userRoleEnum: Record<UserRole, { text: string }> = {
  admin: { text: '系统管理员' },
  manager: { text: '部门负责人' },
  editor: { text: '内容编辑' },
  viewer: { text: '只读成员' },
};

const userStatusEnum: Record<
  UserStatus,
  { text: string; status: 'Success' | 'Processing' | 'Error' }
> = {
  active: { text: '已启用', status: 'Success' },
  pending: { text: '待激活', status: 'Processing' },
  suspended: { text: '已停用', status: 'Error' },
};

const UserManagement: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [currentRow, setCurrentRow] = useState<ManagedUserItem>();
  const [selectedRowsState, setSelectedRowsState] = useState<ManagedUserItem[]>(
    [],
  );

  const [messageApi, contextHolder] = message.useMessage();

  const roleOptions = useMemo(
    () =>
      (Object.keys(userRoleEnum) as UserRole[]).map((key) => ({
        label: userRoleEnum[key].text,
        value: key,
      })),
    [],
  );

  const statusOptions = useMemo(
    () =>
      (Object.keys(userStatusEnum) as UserStatus[]).map((key) => ({
        label: userStatusEnum[key].text,
        value: key,
      })),
    [],
  );

  const handleAdd = async (values: UserFormValues) => {
    try {
      const response = await createManagedUser(values);
      if (response?.success === false) {
        throw new Error('create user failed');
      }
      messageApi.success('新建用户成功');
      actionRef.current?.reload();
      return true;
    } catch (_error) {
      messageApi.error('新建用户失败，请稍后重试');
      return false;
    }
  };

  const handleUpdate = async (id: string, values: UserFormValues) => {
    try {
      const response = await updateManagedUser({ id, ...values });
      if (response?.success === false) {
        throw new Error('update user failed');
      }
      messageApi.success('更新用户成功');
      actionRef.current?.reload();
      return true;
    } catch (_error) {
      messageApi.error('更新用户失败，请稍后重试');
      return false;
    }
  };

  const handleRemove = async (ids: string[]) => {
    if (!ids.length) {
      messageApi.warning('请选择要删除的用户');
      return false;
    }
    try {
      const response = await removeManagedUsers(ids);
      if (response?.success === false) {
        throw new Error('remove user failed');
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

  const handleStatusToggle = async (record: ManagedUserItem) => {
    const nextStatus: UserStatus =
      record.status === 'active' ? 'suspended' : 'active';
    try {
      const response = await updateManagedUser({
        id: record.id,
        status: nextStatus,
      });
      if (response?.success === false) {
        throw new Error('status update failed');
      }
      messageApi.success('状态更新成功');
      actionRef.current?.reload();
      return true;
    } catch (_error) {
      messageApi.error('状态更新失败，请稍后重试');
      return false;
    }
  };

  const renderFormItems = () => (
    <>
      <ProFormText
        name="name"
        label="用户姓名"
        width="md"
        placeholder="请输入用户姓名"
        rules={[{ required: true, message: '请输入用户姓名' }]}
      />
      <ProFormText
        name="email"
        label="邮箱"
        width="md"
        placeholder="请输入邮箱"
        rules={[
          { required: true, message: '请输入邮箱地址' },
          { type: 'email', message: '请输入正确的邮箱格式' },
        ]}
      />
      <ProFormText
        name="phone"
        label="联系方式"
        width="md"
        placeholder="请输入手机号或座机"
      />
      <ProFormText
        name="department"
        label="所属部门"
        width="md"
        placeholder="请输入所属部门"
      />
      <ProFormSelect
        name="role"
        label="角色"
        width="md"
        options={roleOptions}
        rules={[{ required: true, message: '请选择角色' }]}
      />
      <ProFormSelect
        name="status"
        label="状态"
        width="md"
        options={statusOptions}
        rules={[{ required: true, message: '请选择状态' }]}
      />
      <ProFormTextArea
        name="notes"
        label="备注"
        placeholder="记录该用户的业务标签、合作情况等"
        fieldProps={{ rows: 4 }}
      />
    </>
  );

  const columns: ProColumns<ManagedUserItem>[] = [
    {
      title: '关键字搜索',
      dataIndex: 'keyword',
      hideInTable: true,
    },
    {
      title: '姓名',
      dataIndex: 'name',
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
      title: '邮箱',
      dataIndex: 'email',
      copyable: true,
    },
    {
      title: '联系方式',
      dataIndex: 'phone',
      width: 160,
    },
    {
      title: '所属部门',
      dataIndex: 'department',
      width: 160,
    },
    {
      title: '角色',
      dataIndex: 'role',
      valueType: 'select',
      valueEnum: userRoleEnum,
      width: 140,
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      valueEnum: userStatusEnum,
      width: 140,
    },
    {
      title: '最后登录时间',
      dataIndex: 'lastLogin',
      valueType: 'dateTime',
      hideInSearch: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      hideInSearch: true,
      sorter: true,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 220,
      fixed: 'right',
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
            title={
              record.status === 'active'
                ? '确认停用该用户吗？'
                : '确认启用该用户吗？'
            }
            onConfirm={() => handleStatusToggle(record)}
          >
            <a>{record.status === 'active' ? '停用' : '启用'}</a>
          </Popconfirm>
          <Popconfirm
            title="确认删除该用户吗？"
            onConfirm={() => handleRemove([record.id])}
          >
            <a>删除</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const descriptionColumns: ProDescriptionsItemProps<ManagedUserItem>[] = [
    {
      title: '姓名',
      dataIndex: 'name',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
    },
    {
      title: '联系方式',
      dataIndex: 'phone',
    },
    {
      title: '所属部门',
      dataIndex: 'department',
    },
    {
      title: '角色',
      dataIndex: 'role',
      valueEnum: userRoleEnum,
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueEnum: userStatusEnum,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
    },
    {
      title: '最后登录时间',
      dataIndex: 'lastLogin',
      valueType: 'dateTime',
    },
    {
      title: '备注',
      dataIndex: 'notes',
      valueType: 'textarea',
    },
  ];

  return (
    <PageContainer>
      {contextHolder}
      <ProTable<ManagedUserItem, ManagedUserQueryParams>
        headerTitle="用户管理"
        actionRef={actionRef}
        rowKey="id"
        search={{ labelWidth: 96 }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="create"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalOpen(true)}
          >
            新建用户
          </Button>,
        ]}
        request={async (params, sorter) => {
          const query: ManagedUserQueryParams = {
            ...params,
            sorter:
              sorter && Object.keys(sorter).length
                ? JSON.stringify(sorter)
                : undefined,
          };
          const response = await queryManagedUsers(query);
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
              <a style={{ fontWeight: 600 }}>{selectedRowsState.length}</a>{' '}
              位用户
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

      <ModalForm<UserFormValues>
        title="新建用户"
        width={520}
        modalProps={{
          destroyOnClose: true,
          onCancel: () => setCreateModalOpen(false),
        }}
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        initialValues={{
          status: 'active',
          role: 'viewer',
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

      <ModalForm<UserFormValues>
        key={currentRow?.id || 'update'}
        title="编辑用户"
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
        initialValues={currentRow}
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
        title={currentRow?.name ? `${currentRow.name} - 用户详情` : '用户详情'}
      >
        {currentRow && (
          <ProDescriptions<ManagedUserItem>
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

export default UserManagement;
