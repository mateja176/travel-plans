import qs from 'qs';

describe('runtime', () => {
  describe('queryString', () => {
    test('or', () => {
      const search = 'test';
      expect(
        qs.stringify(
          {
            where: [
              { destination_contains: search },
              { comment_contains: search },
            ],
          },
          { encode: false },
        ),
      ).toBe(
        'where[0][destination_contains]=test&where[1][comment_contains]=test',
      );
    });
  });
});
