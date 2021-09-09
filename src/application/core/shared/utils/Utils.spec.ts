import { Utils } from './Utils';
import ArrayLike = jasmine.ArrayLike;

localStorage.setItem = jest.fn();

describe('Utils', () => {

  let instance: Utils;

  beforeEach(() => {
    instance = new Utils();
  });

  describe('inArray', () => {
    it.each([
      [[], '', false],
      [[''], '', true],
      [['1'], 1, false],
      [[1], '1', false],
      [[1, 2, 3, 4, 5, 6, 7, 8, 9, 0], 9, true],
      ['30-31', '-', true],
    ])('should return desired value', (array, item, expected) => {
      expect(instance.inArray(array, item)).toBe(expected);
    });
  });

  describe('timeoutPromise', () => {
    it.each([[Error()], [Error('Communication timeout')]])('should reject with the specified error', async error => {
      // @ts-ignore
      await expect(instance.timeoutPromise(0, error)).rejects.toThrow(error);
    });

    it.each([[500], [10]])('should reject after the specified time', async timeout => {
      const before = Date.now();
      let after = before;
      // @ts-ignore
      await instance.timeoutPromise(timeout).catch(() => (after = Date.now()));
      // toBeCloseTo is intended to check N significant figures of floats
      // but by using -2 we can check it's within 50ms of the set value
      expect(after - before).toBeCloseTo(timeout, -2);
    });
  });

  describe('promiseWithTimeout', () => {
    it.each([[{}, '42']])('should resolve with the promissory\'s value if it finishes first', async value => {
      function promissory() {
        return new Promise(resolve => resolve(value));
      }

      await expect(instance.promiseWithTimeout(promissory)).resolves.toEqual(value);
    });

    it.each([[Error(), Error('Communication timeout')]])(
      'should reject with the promissory\'s error if it finishes first',
      async err => {
        function promissory() {
          return new Promise((_, reject) => reject(err));
        }

        await expect(instance.promiseWithTimeout(promissory)).rejects.toEqual(err);
      }
    );

    it('should reject with the timeout if it times out', async () => {
      const err = new Error('Timeout error');
      // @ts-ignore
      await expect(instance.promiseWithTimeout(() => instance.timeoutPromise(5), 2, err)).rejects.toEqual(err);
    });
  });

  describe('retryPromise', () => {
    it.each([[0], [1]])('should resolve as soon as the first promise does so', async rejects => {
      const value = {};
      let promises = rejects;
      const promissory = jest.fn(() => {
        if (promises > 0) {
          promises--;
          return Promise.reject();
        }
        return new Promise(resolve => resolve(value));
      });
      await expect(instance.retryPromise(promissory)).resolves.toEqual(value);
      expect(promissory).toHaveBeenCalledTimes(rejects + 1);
    });

    it.each([
      [10, 5, 1, Error('Connection timeout')],
      [900, 1, 1, Error('Retry')],
      [1000, 5, 5, Error('Retries')],
    ])('should reject with the last error after max retries or time', async (timeout, attempts, expected, error) => {
      // @ts-ignore
      const promissory = jest.fn(() => instance.timeoutPromise(10, error));
      await expect(instance.retryPromise(promissory, 0, attempts, timeout)).rejects.toThrow(error);
      expect(promissory.mock.calls.length).toBe(expected);
    });
  });

  describe('instance.stripChars', () => {
    it('should return string with only digits when regex is not specified', () => {
      expect(instance.stripChars('s1o2me3t4es5t   val6ue')).toEqual('123456');
    });

    it('should adjust string to given regex', () => {
      expect(instance.stripChars('Quit  yo jibba  jabba !', /\s/g)).toEqual('Quityojibbajabba!');
    });
  });
});
