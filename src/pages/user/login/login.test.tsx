// @ts-ignore
import { startMock } from '@@/requestRecordMock';
import { TestBrowser } from '@@/testBrowser';
import { fireEvent, render } from '@testing-library/react';
import * as React from 'react';
import { act } from 'react';
import { signInWithEmail } from '@/services/firebase/auth';

const mockFirebaseUser = {
  uid: 'test-user',
  displayName: 'Test User',
  email: 'test-user@example.com',
  photoURL: 'https://example.com/avatar.png',
};

jest.mock('@/services/firebase/auth', () => {
  return {
    signInWithEmail: jest.fn(async () => ({ user: mockFirebaseUser })),
    signInWithGoogle: jest.fn(async () => ({ user: mockFirebaseUser })),
    waitForFirebaseUser: jest.fn(async () => null),
    hasValidFirebaseConfig: jest.fn(() => true),
    mapFirebaseUserToCurrentUser: jest.fn((user: any) => ({
      name: user?.displayName ?? 'Test User',
      email: user?.email ?? '',
      avatar: user?.photoURL ?? '',
      userid: user?.uid ?? 'test-user',
    })),
  };
});

const waitTime = (time: number = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};

let server: {
  close: () => void;
};

describe('Login Page', () => {
  beforeAll(async () => {
    server = await startMock({
      port: 8000,
      scene: 'login',
    });
  });

  afterAll(() => {
    server?.close();
  });

  it('should show login form', async () => {
    const historyRef = React.createRef<any>();
    const rootContainer = render(
      <TestBrowser
        historyRef={historyRef}
        location={{
          pathname: '/user/login',
        }}
      />,
    );

    await rootContainer.findAllByText('Ant Design');

    act(() => {
      historyRef.current?.push('/user/login');
    });

    expect(
      rootContainer.baseElement?.querySelector('.ant-pro-form-login-desc')
        ?.textContent,
    ).toBe(
      'Ant Design is the most influential web design specification in Xihu district',
    );

    expect(rootContainer.asFragment()).toMatchSnapshot();

    rootContainer.unmount();
  });

  it('should login success', async () => {
    const historyRef = React.createRef<any>();
    const rootContainer = render(
      <TestBrowser
        historyRef={historyRef}
        location={{
          pathname: '/user/login',
        }}
      />,
    );

    await rootContainer.findAllByText('Ant Design');

    const emailInput = await rootContainer.findByPlaceholderText(
      'Email: user@example.com',
    );

    act(() => {
      fireEvent.change(emailInput, {
        target: { value: 'test-user@example.com' },
      });
    });

    const passwordInput =
      await rootContainer.findByPlaceholderText('Password: ******');

    act(() => {
      fireEvent.change(passwordInput, { target: { value: 'secret' } });
    });

    await (await rootContainer.findByText('Login')).click();

    // 等待接口返回结果
    await waitTime(5000);

    await rootContainer.findAllByText('Crew Dashboard');

    expect(signInWithEmail).toHaveBeenCalledWith(
      'test-user@example.com',
      'secret',
    );

    expect(rootContainer.asFragment()).toMatchSnapshot();

    await waitTime(2000);

    rootContainer.unmount();
  });
});
