import crypto from 'crypto';
import _fetch from 'isomorphic-fetch';
import { readOrigin } from '../utils/utils';

const origin = readOrigin();

describe('users', () => {
  test('register & login', async () => {
    const username = crypto.randomBytes(10).toString('hex');
    const password = crypto.randomBytes(10).toString('hex');
    const registerBody = JSON.stringify({
      username,
      email: `${username}@doe.com`,
      password,
    });
    const requestConfig = {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
    };
    const { user } = await (
      await _fetch(new URL('/auth/local/register', origin).href, {
        ...requestConfig,
        body: registerBody,
      })
    ).json();

    const loginResponse = await (
      await _fetch(new URL('/auth/local', origin).href, {
        ...requestConfig,
        body: JSON.stringify({
          identifier: user.email,
          password,
        }),
      })
    ).json();
    const { jwt } = loginResponse;

    expect(typeof jwt).toBe('string');
  });
});
