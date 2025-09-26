import { useIntl } from '@umijs/max';
import { List, Switch } from 'antd';
import React, { useMemo } from 'react';

type Unpacked<T> = T extends (infer U)[] ? U : T;

const NotificationView: React.FC = () => {
  const intl = useIntl();
  const switchAction = useMemo(
    () => (
      <Switch
        checkedChildren={intl.formatMessage({
          id: 'pages.account.settings.notification.switch.open',
        })}
        unCheckedChildren={intl.formatMessage({
          id: 'pages.account.settings.notification.switch.close',
        })}
        defaultChecked
      />
    ),
    [intl],
  );
  const data = useMemo(
    () => [
      {
        title: intl.formatMessage({
          id: 'pages.account.settings.notification.user',
        }),
        description: intl.formatMessage({
          id: 'pages.account.settings.notification.user-description',
        }),
        actions: [switchAction],
      },
      {
        title: intl.formatMessage({
          id: 'pages.account.settings.notification.system',
        }),
        description: intl.formatMessage({
          id: 'pages.account.settings.notification.system-description',
        }),
        actions: [switchAction],
      },
      {
        title: intl.formatMessage({
          id: 'pages.account.settings.notification.todo',
        }),
        description: intl.formatMessage({
          id: 'pages.account.settings.notification.todo-description',
        }),
        actions: [switchAction],
      },
    ],
    [intl, switchAction],
  );
  return (
    <List<Unpacked<typeof data>>
      itemLayout="horizontal"
      dataSource={data}
      renderItem={(item) => (
        <List.Item actions={item.actions}>
          <List.Item.Meta title={item.title} description={item.description} />
        </List.Item>
      )}
    />
  );
};

export default NotificationView;
