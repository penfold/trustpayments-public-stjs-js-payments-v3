import { EventDataSanitizer } from './EventDataSanitizer';

describe('EventDataSanitizer', () => {
  let sanitizer: EventDataSanitizer;

  beforeAll(() => {
    sanitizer = new EventDataSanitizer();
  });

  describe('sanitize()', () => {
    it.each<unknown>(['foobar', 123, true, null, undefined])('should not modify simple type data', data => {
      expect(sanitizer.sanitize(data)).toBe(data);
    });

    it('should not modify an array of simple type data', () => {
      expect(sanitizer.sanitize(['foobar', 123, true])).toEqual(['foobar', 123, true]);
    });

    it('should replace function with string', () => {
      expect(sanitizer.sanitize(() => {})).toBe('[function]');
    });

    it('should not modify an object with simple type values', () => {
      const obj = { a: 'foobar', b: 123, c: true };
      expect(sanitizer.sanitize(obj)).toEqual(obj);
    });

    it('should remove any functions from complex nested objects', () => {
      const obj = {
        foo: 'bar',
        func: () => {},
        nested: {
          func: () => {},
          bar: 123,
          arr: [
            {
              someBool: true,
            },
            {
              func: () => {},
            },
            {
              arrayOfFunc: [
                () => {},
                () => {},
                () => {},
              ],
            },
          ],
        },
      };

      expect(sanitizer.sanitize(obj)).toEqual({
        foo: 'bar',
        func: '[function]',
        nested: {
          func: '[function]',
          bar: 123,
          arr: [
            {
              someBool: true,
            },
            {
              func: '[function]',
            },
            {
              arrayOfFunc: [
                '[function]',
                '[function]',
                '[function]',
              ],
            },
          ],
        },
      });
    });

    it('should serialize Error objects', () => {
      const result = sanitizer.sanitize(new Error('foobar'));

      expect(result).toEqual({
        name: 'Error',
        message: 'foobar',
        stack: expect.any(String),
      });
    });
  });
});
