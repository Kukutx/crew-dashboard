import type { EventItem } from '@/services/events';
import {
  createEvent,
  deleteEvent,
  getEvents,
  updateEvent,
} from '@/services/events';
import { PlusOutlined } from '@ant-design/icons';
import {
  ActionType,
  ModalForm,
  ProColumns,
  ProFormDatePicker,
  ProFormText,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import { Button, message, Popconfirm } from 'antd';
import { useRef, useState } from 'react';

const EventsTable: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [modalVisible, setModalVisible] = useState(false);
  const [current, setCurrent] = useState<EventItem | undefined>();

  const columns: ProColumns<EventItem>[] = [
    { title: 'Title', dataIndex: 'title' },
    { title: 'Date', dataIndex: 'date' },
    { title: 'Description', dataIndex: 'description', ellipsis: true },
    {
      title: 'Actions',
      valueType: 'option',
      render: (_, record) => [
        <a
          key="edit"
          onClick={() => {
            setCurrent(record);
            setModalVisible(true);
          }}
        >
          Edit
        </a>,
        <Popconfirm
          key="delete"
          title="Delete this event?"
          onConfirm={async () => {
            await deleteEvent({ id: record.id! });
            message.success('Deleted successfully');
            actionRef.current?.reload();
          }}
        >
          <a>Delete</a>
        </Popconfirm>,
      ],
    },
  ];

  return (
    <>
      <ProTable<EventItem>
        columns={columns}
        actionRef={actionRef}
        request={async () => {
          const data = await getEvents();
          return { data, success: true };
        }}
        rowKey="id"
        search={false}
        toolBarRender={() => [
          <Button
            key="add"
            type="primary"
            onClick={() => {
              setCurrent(undefined);
              setModalVisible(true);
            }}
          >
            <PlusOutlined /> New Event
          </Button>,
        ]}
      />
      <ModalForm<EventItem>
        title={current?.id ? 'Edit Event' : 'New Event'}
        open={modalVisible}
        initialValues={current}
        onOpenChange={setModalVisible}
        onFinish={async (values) => {
          if (current?.id) {
            await updateEvent({ id: current.id }, values);
            message.success('Updated successfully');
          } else {
            await createEvent(values);
            message.success('Created successfully');
          }
          actionRef.current?.reload();
          return true;
        }}
      >
        <ProFormText
          name="title"
          label="Title"
          rules={[{ required: true, message: 'Please enter a title' }]}
        />
        <ProFormDatePicker
          name="date"
          label="Date"
          rules={[{ required: true, message: 'Please select a date' }]}
        />
        <ProFormTextArea name="description" label="Description" />
      </ModalForm>
    </>
  );
};

export default EventsTable;
