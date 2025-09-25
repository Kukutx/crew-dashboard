import { GoogleOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import {
  LoginForm,
  ProFormCheckbox,
  ProFormText,
} from '@ant-design/pro-components';
import {
  FormattedMessage,
  Helmet,
  SelectLang,
  useIntl,
  useModel,
} from '@umijs/max';
import { Alert, App, Button } from 'antd';
import { createStyles } from 'antd-style';
import React, { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { Footer } from '@/components';
import {
  hasValidFirebaseConfig,
  mapFirebaseUserToCurrentUser,
  signInWithEmail,
  signInWithGoogle,
} from '@/services/firebase/auth';
import Settings from '../../../../config/defaultSettings';

const useStyles = createStyles(({ token }) => {
  return {
    action: {
      display: 'flex',
      gap: token.marginXS,
      alignItems: 'center',
    },
    lang: {
      width: 42,
      height: 42,
      lineHeight: '42px',
      position: 'fixed',
      right: 16,
      borderRadius: token.borderRadius,
      ':hover': {
        backgroundColor: token.colorBgTextHover,
      },
    },
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'auto',
      backgroundImage:
        "url('https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/V-_oS6r-i7wAAAAAAAAAAAAAFl94AQBr')",
      backgroundSize: '100% 100%',
    },
  };
});

const Lang = () => {
  const { styles } = useStyles();

  return (
    <div className={styles.lang} data-lang>
      {SelectLang && <SelectLang />}
    </div>
  );
};

const LoginMessage: React.FC<{
  content: string;
}> = ({ content }) => {
  return (
    <Alert
      style={{
        marginBottom: 24,
      }}
      message={content}
      type="error"
      showIcon
    />
  );
};

const Login: React.FC = () => {
  const [authError, setAuthError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { setInitialState } = useModel('@@initialState');
  const { styles } = useStyles();
  const { message } = App.useApp();
  const intl = useIntl();
  const firebaseConfigReady = hasValidFirebaseConfig();

  const syncUserState = (user: any) => {
    if (!user) {
      return;
    }

    const currentUser = mapFirebaseUserToCurrentUser(user);
    flushSync(() => {
      setInitialState((s) => ({
        ...s,
        currentUser,
      }));
    });
  };

  const redirectToApp = () => {
    const urlParams = new URL(window.location.href).searchParams;
    const redirect = urlParams.get('redirect');
    window.location.href = redirect || '/';
  };

  const getConfigMissingMessage = () =>
    intl.formatMessage({
      id: 'pages.login.firebase.configMissing',
      defaultMessage: 'Firebase 配置缺失，请联系管理员。',
    });

  const getErrorMessage = (error: unknown) => {
    const defaultMessage = intl.formatMessage({
      id: 'pages.login.failure',
      defaultMessage: '登录失败，请重试！',
    });

    if (!error) {
      return defaultMessage;
    }

    if (typeof error === 'string') {
      return error;
    }

    const errorWithCode = error as {
      code?: string;
      message?: string;
    };

    if (errorWithCode.code) {
      switch (errorWithCode.code) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
          return intl.formatMessage({
            id: 'pages.login.firebase.invalidCredential',
            defaultMessage: '凭证无效，请检查邮箱和密码。',
          });
        case 'auth/invalid-email':
          return intl.formatMessage({
            id: 'pages.login.firebase.invalidEmail',
            defaultMessage: '邮箱格式不正确。',
          });
        case 'auth/user-disabled':
          return intl.formatMessage({
            id: 'pages.login.firebase.userDisabled',
            defaultMessage: '该账户已被禁用，请联系管理员。',
          });
        case 'auth/user-not-found':
          return intl.formatMessage({
            id: 'pages.login.firebase.userNotFound',
            defaultMessage: '未找到匹配的账户。',
          });
        case 'auth/popup-closed-by-user':
          return intl.formatMessage({
            id: 'pages.login.firebase.popupClosed',
            defaultMessage: '登录流程已取消。',
          });
        case 'auth/cancelled-popup-request':
          return intl.formatMessage({
            id: 'pages.login.firebase.popupCancelled',
            defaultMessage: '已有登录请求正在进行，请稍后重试。',
          });
        default:
          break;
      }
    }

    if (errorWithCode.message?.includes('Firebase configuration is missing')) {
      return getConfigMissingMessage();
    }

    if (error instanceof Error && error.message) {
      return error.message;
    }

    if (errorWithCode.message) {
      return errorWithCode.message;
    }

    return defaultMessage;
  };

  const handleEmailLogin = async (values: {
    email: string;
    password: string;
  }) => {
    if (!firebaseConfigReady) {
      const configMessage = getConfigMissingMessage();
      setAuthError(configMessage);
      message.error(configMessage);
      return false;
    }

    setSubmitting(true);
    setAuthError(null);

    try {
      const credential = await signInWithEmail(values.email, values.password);
      syncUserState(credential?.user);
      message.success(
        intl.formatMessage({
          id: 'pages.login.success',
          defaultMessage: '登录成功！',
        }),
      );
      redirectToApp();
      return true;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setAuthError(errorMessage);
      message.error(errorMessage);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!firebaseConfigReady) {
      const configMessage = getConfigMissingMessage();
      setAuthError(configMessage);
      message.error(configMessage);
      return;
    }

    setSubmitting(true);
    setAuthError(null);

    try {
      const credential = await signInWithGoogle();
      syncUserState(credential?.user);
      message.success(
        intl.formatMessage({
          id: 'pages.login.google.success',
          defaultMessage: 'Google 登录成功！',
        }),
      );
      redirectToApp();
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setAuthError(errorMessage);
      message.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!firebaseConfigReady) {
      const configMessage = getConfigMissingMessage();
      setAuthError((current) => current ?? configMessage);
    }
  }, [firebaseConfigReady, intl]);

  return (
    <div className={styles.container}>
      <Helmet>
        <title>
          {intl.formatMessage({
            id: 'menu.login',
            defaultMessage: '登录页',
          })}
          {Settings.title && ` - ${Settings.title}`}
        </title>
      </Helmet>
      <Lang />
      <div
        style={{
          flex: '1',
          padding: '32px 0',
        }}
      >
        <LoginForm
          contentStyle={{
            minWidth: 280,
            maxWidth: '75vw',
          }}
          logo={<img alt="logo" src="/logo.svg" />}
          title="Ant Design"
          subTitle={intl.formatMessage({
            id: 'pages.layouts.userLayout.title',
          })}
          initialValues={{
            autoLogin: true,
          }}
          submitter={{
            searchConfig: {
              submitText: intl.formatMessage({
                id: 'pages.login.submit',
                defaultMessage: '登录',
              }),
            },
            submitButtonProps: {
              size: 'large',
              loading: submitting,
            },
          }}
          actions={[
            <FormattedMessage
              key="loginWith"
              id="pages.login.loginWith"
              defaultMessage="其他登录方式"
            />,
            <div className={styles.action} key="google">
              <Button
                block
                icon={<GoogleOutlined />}
                loading={submitting}
                onClick={handleGoogleLogin}
                size="large"
                type="default"
                disabled={!firebaseConfigReady}
              >
                {intl.formatMessage({
                  id: 'pages.login.googleLogin',
                  defaultMessage: '使用 Google 登录',
                })}
              </Button>
            </div>,
          ]}
          onFinish={async (values) => {
            return handleEmailLogin(
              values as { email: string; password: string },
            );
          }}
        >
          {authError ? <LoginMessage content={authError} /> : null}
          <ProFormText
            name="email"
            fieldProps={{
              size: 'large',
              prefix: <MailOutlined />,
              type: 'email',
            }}
            placeholder={intl.formatMessage({
              id: 'pages.login.email.placeholder',
              defaultMessage: '邮箱: user@example.com',
            })}
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="pages.login.email.required"
                    defaultMessage="请输入邮箱！"
                  />
                ),
              },
              {
                type: 'email',
                message: (
                  <FormattedMessage
                    id="pages.login.email.invalid"
                    defaultMessage="邮箱格式不正确！"
                  />
                ),
              },
            ]}
          />
          <ProFormText.Password
            name="password"
            fieldProps={{
              size: 'large',
              prefix: <LockOutlined />,
            }}
            placeholder={intl.formatMessage({
              id: 'pages.login.password.placeholder',
              defaultMessage: '密码: ******',
            })}
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="pages.login.password.required"
                    defaultMessage="请输入密码！"
                  />
                ),
              },
            ]}
          />
          <div
            style={{
              marginBottom: 24,
            }}
          >
            <ProFormCheckbox noStyle name="autoLogin">
              <FormattedMessage
                id="pages.login.rememberMe"
                defaultMessage="自动登录"
              />
            </ProFormCheckbox>
            <a
              style={{
                float: 'right',
              }}
            >
              <FormattedMessage
                id="pages.login.forgotPassword"
                defaultMessage="忘记密码"
              />
            </a>
          </div>
        </LoginForm>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
