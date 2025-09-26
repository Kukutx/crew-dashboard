import { UploadOutlined } from '@ant-design/icons';
import {
  ProForm,
  ProFormDependency,
  ProFormFieldSet,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { useIntl, useModel, useRequest } from '@umijs/max';
import { Button, Input, message, Upload } from 'antd';
import React, { useMemo } from 'react';
import { DEFAULT_AVATAR_URL } from '@/services/firebase/auth';
import { queryCity, queryCurrent, queryProvince } from '../service';
import useStyles from './index.style';

const BaseView: React.FC = () => {
  const { styles } = useStyles();
  const intl = useIntl();
  const validatorPhone = (
    _rule: any,
    value: string[],
    callback: (message?: string) => void,
  ) => {
    if (!value[0]) {
      callback(
        intl.formatMessage({
          id: 'pages.account.settings.phone.area-code',
        }),
      );
      return;
    }
    if (!value[1]) {
      callback(
        intl.formatMessage({
          id: 'pages.account.settings.phone.number',
        }),
      );
      return;
    }
    callback();
  };
  const { initialState } = useModel('@@initialState');
  const resolvedCurrentUser = initialState?.currentUser;
  // 头像组件 方便以后独立，增加裁剪之类的功能
  const AvatarView = ({ avatar }: { avatar: string }) => (
    <>
      <div className={styles.avatar_title}>
        {intl.formatMessage({ id: 'pages.account.settings.avatar.title' })}
      </div>
      <div className={styles.avatar}>
        <img src={avatar} alt="avatar" />
      </div>
      <Upload showUploadList={false}>
        <div className={styles.button_view}>
          <Button>
            <UploadOutlined />
            {intl.formatMessage({ id: 'pages.account.settings.avatar.button' })}
          </Button>
        </div>
      </Upload>
    </>
  );
  const { data: fallbackUser, loading: loadingFallbackUser } = useRequest(
    queryCurrent,
    {
      ready: !resolvedCurrentUser,
    },
  );

  const currentUser = resolvedCurrentUser ?? fallbackUser;

  const initialValues = useMemo(() => {
    if (!currentUser) {
      return {
        email: '',
      };
    }

    return {
      ...currentUser,
      email: currentUser.email ?? '',
      phone: currentUser.phone ? currentUser.phone.split('-') : undefined,
    };
  }, [currentUser]);

  const getAvatarURL = () => {
    const avatar = currentUser?.avatar;
    if (avatar && avatar.trim().length > 0) {
      return avatar;
    }
    return DEFAULT_AVATAR_URL;
  };

  const loading = !currentUser && loadingFallbackUser;
  const handleFinish = async () => {
    message.success(
      intl.formatMessage({ id: 'pages.account.settings.success' }),
    );
  };
  return (
    <div className={styles.baseView}>
      {loading ? null : (
        <>
          <div className={styles.left}>
            <ProForm
              key={
                currentUser?.userid ?? currentUser?.email ?? 'anonymous-user'
              }
              layout="vertical"
              onFinish={handleFinish}
              submitter={{
                searchConfig: {
                  submitText: intl.formatMessage({
                    id: 'pages.account.settings.update',
                  }),
                },
                render: (_, dom) => dom[1],
              }}
              initialValues={initialValues}
              hideRequiredMark
            >
              <ProFormText
                width="md"
                name="email"
                label={intl.formatMessage({
                  id: 'pages.account.settings.email',
                })}
                disabled
                rules={[
                  {
                    required: true,
                    message: intl.formatMessage({
                      id: 'pages.account.settings.email-message',
                    }),
                  },
                ]}
              />
              <ProFormText
                width="md"
                name="name"
                label={intl.formatMessage({
                  id: 'pages.account.settings.nickname',
                })}
                rules={[
                  {
                    required: true,
                    message: intl.formatMessage({
                      id: 'pages.account.settings.nickname-message',
                    }),
                  },
                ]}
              />
              <ProFormTextArea
                name="profile"
                label={intl.formatMessage({
                  id: 'pages.account.settings.profile',
                })}
                rules={[
                  {
                    required: true,
                    message: intl.formatMessage({
                      id: 'pages.account.settings.profile-message',
                    }),
                  },
                ]}
                placeholder={intl.formatMessage({
                  id: 'pages.account.settings.profile-placeholder',
                })}
              />
              <ProFormSelect
                width="sm"
                name="country"
                label={intl.formatMessage({
                  id: 'pages.account.settings.country',
                })}
                rules={[
                  {
                    required: true,
                    message: intl.formatMessage({
                      id: 'pages.account.settings.country-message',
                    }),
                  },
                ]}
                options={[
                  {
                    label: intl.formatMessage({
                      id: 'pages.account.settings.country.china',
                    }),
                    value: 'China',
                  },
                ]}
              />

              <ProForm.Group
                title={intl.formatMessage({
                  id: 'pages.account.settings.geographic',
                })}
                size={8}
              >
                <ProFormSelect
                  rules={[
                    {
                      required: true,
                      message: intl.formatMessage({
                        id: 'pages.account.settings.province-message',
                      }),
                    },
                  ]}
                  width="sm"
                  fieldProps={{
                    labelInValue: true,
                  }}
                  name="province"
                  request={async () => {
                    return queryProvince().then(({ data }) => {
                      return data.map((item) => {
                        return {
                          label: item.name,
                          value: item.id,
                        };
                      });
                    });
                  }}
                />
                <ProFormDependency name={['province']}>
                  {({ province }) => {
                    return (
                      <ProFormSelect
                        params={{
                          key: province?.value,
                        }}
                        name="city"
                        width="sm"
                        rules={[
                          {
                            required: true,
                            message: intl.formatMessage({
                              id: 'pages.account.settings.city-message',
                            }),
                          },
                        ]}
                        disabled={!province}
                        request={async () => {
                          if (!province?.key) {
                            return [];
                          }
                          return queryCity(province.key || '').then(
                            ({ data }) => {
                              return data.map((item) => {
                                return {
                                  label: item.name,
                                  value: item.id,
                                };
                              });
                            },
                          );
                        }}
                      />
                    );
                  }}
                </ProFormDependency>
              </ProForm.Group>
              <ProFormText
                width="md"
                name="address"
                label={intl.formatMessage({
                  id: 'pages.account.settings.address',
                })}
                rules={[
                  {
                    required: true,
                    message: intl.formatMessage({
                      id: 'pages.account.settings.address-message',
                    }),
                  },
                ]}
              />
              <ProFormFieldSet
                name="phone"
                label={intl.formatMessage({
                  id: 'pages.account.settings.phone',
                })}
                rules={[
                  {
                    required: true,
                    message: intl.formatMessage({
                      id: 'pages.account.settings.phone-message',
                    }),
                  },
                  {
                    validator: validatorPhone,
                  },
                ]}
              >
                <Input className={styles.area_code} />
                <Input className={styles.phone_number} />
              </ProFormFieldSet>
            </ProForm>
          </div>
          <div className={styles.right}>
            <AvatarView avatar={getAvatarURL()} />
          </div>
        </>
      )}
    </div>
  );
};
export default BaseView;
