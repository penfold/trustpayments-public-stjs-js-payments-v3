import { ArrayUtils } from './ArrayUtils';

describe('ArrayUtils', () => {
  describe('unique()', () => {
    it.each([
      [
        ['foo', 'foo', 'foo', 'bar', '', ''],
        ['foo', 'bar', ''],
      ],
      [
        [123, 1, 1, 0, 123, 234],
        [123, 1, 0, 234],
      ],
      [
        ['foo', 'foo', 123, 123, 123, true, true, null, null, undefined, undefined],
        ['foo', 123, true, null, undefined],
      ],
      [
        [],
        [],
      ],
    ])('removes duplicates from array', (given, expected) => {
      expect(ArrayUtils.unique(given)).toEqual(expected);
    });
  });
});
