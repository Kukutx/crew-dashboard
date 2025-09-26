import { useIntl } from '@umijs/max';
import { List } from 'antd';
import React, { useMemo } from 'react';

type Unpacked<T> = T extends (infer U)[] ? U : T;

const SecurityView: React.FC = () => {
  const intl = useIntl();
  const passwordStrength = useMemo(
    () => ({
      strong: (
        <span className="strong">
          {intl.formatMessage({ id: 'pages.account.settings.security.strong' })}
        </span>
      ),
      medium: (
        <span className="medium">
          {intl.formatMessage({ id: 'pages.account.settings.security.medium' })}
        </span>
      ),
      weak: (
        <span className="weak">
          {intl.formatMessage({ id: 'pages.account.settings.security.weak' })}
        </span>
      ),
    }),
    [intl],
  );
  const data = useMemo(
    () => [
      {
        title: intl.formatMessage({
          id: 'pages.account.settings.security.password',
        }),
        description: (
          <>
            {intl.formatMessage({
              id: 'pages.account.settings.security.password-description',
            })}
            {passwordStrength.strong}
          </>
        ),
        actions: [
          <a key="Modify">
            {intl.formatMessage({
              id: 'pages.account.settings.security.modify',
            })}
          </a>,
        ],
      },
      {
        title: intl.formatMessage({
          id: 'pages.account.settings.security.phone',
        }),
        description: intl.formatMessage(
          { id: 'pages.account.settings.security.phone-description' },
          { phone: '138****8293' },
        ),
        actions: [
          <a key="Modify">
            {intl.formatMessage({
              id: 'pages.account.settings.security.modify',
            })}
          </a>,
        ],
      },
      {
        title: intl.formatMessage({
          id: 'pages.account.settings.security.question',
        }),
        description: intl.formatMessage({
          id: 'pages.account.settings.security.question-description',
        }),
        actions: [
          <a key="Set">
            {intl.formatMessage({ id: 'pages.account.settings.security.set' })}
          </a>,
        ],
      },
      {
        title: intl.formatMessage({
          id: 'pages.account.settings.security.email',
        }),
        description: intl.formatMessage(
          { id: 'pages.account.settings.security.email-description' },
          { email: 'ant***sign.com' },
        ),
        actions: [
          <a key="Modify">
            {intl.formatMessage({
              id: 'pages.account.settings.security.modify',
            })}
          </a>,
        ],
      },
      {
        title: intl.formatMessage({
          id: 'pages.account.settings.security.mfa',
        }),
        description: intl.formatMessage({
          id: 'pages.account.settings.security.mfa-description',
        }),
        actions: [
          <a key="bind">
            {intl.formatMessage({ id: 'pages.account.settings.security.bind' })}
          </a>,
        ],
      },
    ],
    [intl, passwordStrength],
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

export default SecurityView;
