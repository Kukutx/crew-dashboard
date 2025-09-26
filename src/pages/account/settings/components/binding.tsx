import {
  AlipayOutlined,
  DingdingOutlined,
  TaobaoOutlined,
} from '@ant-design/icons';
import { useIntl } from '@umijs/max';
import { List } from 'antd';
import React, { useMemo } from 'react';

const BindingView: React.FC = () => {
  const intl = useIntl();
  const data = useMemo(
    () => [
      {
        title: intl.formatMessage({
          id: 'pages.account.settings.binding.taobao',
        }),
        description: intl.formatMessage({
          id: 'pages.account.settings.binding.taobao-description',
        }),
        actions: [
          <a key="Bind">
            {intl.formatMessage({ id: 'pages.account.settings.binding.bind' })}
          </a>,
        ],
        avatar: <TaobaoOutlined className="taobao" />,
      },
      {
        title: intl.formatMessage({
          id: 'pages.account.settings.binding.alipay',
        }),
        description: intl.formatMessage({
          id: 'pages.account.settings.binding.alipay-description',
        }),
        actions: [
          <a key="Bind">
            {intl.formatMessage({ id: 'pages.account.settings.binding.bind' })}
          </a>,
        ],
        avatar: <AlipayOutlined className="alipay" />,
      },
      {
        title: intl.formatMessage({
          id: 'pages.account.settings.binding.dingding',
        }),
        description: intl.formatMessage({
          id: 'pages.account.settings.binding.dingding-description',
        }),
        actions: [
          <a key="Bind">
            {intl.formatMessage({ id: 'pages.account.settings.binding.bind' })}
          </a>,
        ],
        avatar: <DingdingOutlined className="dingding" />,
      },
    ],
    [intl],
  );

  return (
    <List
      itemLayout="horizontal"
      dataSource={data}
      renderItem={(item) => (
        <List.Item actions={item.actions}>
          <List.Item.Meta
            avatar={item.avatar}
            title={item.title}
            description={item.description}
          />
        </List.Item>
      )}
    />
  );
};

export default BindingView;
