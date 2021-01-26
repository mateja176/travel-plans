import _fetch from 'isomorphic-fetch';
import { readOrigin, readToken } from '../utils/utils';

const origin = readOrigin();
const token = readToken();

describe('trips', () => {
  test('get all', async () => {
    const trips = await (
      await _fetch(new URL('trips', origin).href, {
        headers: { authorization: `bearer ${token}` },
      })
    ).json();

    expect(Array.isArray(trips)).toBe(true);
  });
});
