import { mapFirebaseUserToCurrentUser } from './auth';

describe('mapFirebaseUserToCurrentUser', () => {
  it('uses Google profile photo when available', () => {
    const user = {
      uid: 'google-user',
      displayName: 'Google User',
      email: 'google-user@example.com',
      photoURL: 'https://example.com/account-photo.jpg',
      providerData: [
        {
          providerId: 'google.com',
          photoURL: 'https://lh3.googleusercontent.com/example-photo',
        },
      ],
    };

    expect(mapFirebaseUserToCurrentUser(user)).toEqual({
      name: 'Google User',
      email: 'google-user@example.com',
      avatar: 'https://lh3.googleusercontent.com/example-photo',
      userid: 'google-user',
    });
  });

  it('falls back to default avatar for email/password users', () => {
    const user = {
      uid: 'password-user',
      email: 'password-user@example.com',
      providerData: [
        {
          providerId: 'password',
          photoURL: 'https://example.com/ignored-photo.jpg',
        },
      ],
    };

    expect(mapFirebaseUserToCurrentUser(user)).toEqual({
      name: 'password-user@example.com',
      email: 'password-user@example.com',
      avatar: undefined,
      userid: 'password-user',
    });
  });
});
