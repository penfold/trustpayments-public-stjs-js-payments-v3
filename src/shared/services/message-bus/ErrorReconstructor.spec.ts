import { ErrorReconstructor } from './ErrorReconstructor';

describe('ErrorReconstructor', () => {
  let errorReconstructor: ErrorReconstructor;

  beforeEach(() => {
    errorReconstructor = new ErrorReconstructor();
  });

  describe('reconstruct', () => {
    it.each(['foo', 123, true, null, []])('returns the passed data when its not an object', data => {
      expect(errorReconstructor.reconstruct(data)).toBe(data);
    });

    it('returns the passed data if its not error-type data', () => {
      const data = { foo: 'bar' };

      expect(errorReconstructor.reconstruct(data)).toBe(data);
    });

    it('creates a new error and fills it with passed error-type data', () => {
      const data = {
        name: 'Error',
        stack: 'errorstack',
        message: 'something went wrong',
        foo: 'bar',
      };

      const result = errorReconstructor.reconstruct(data) as Error & typeof data;

      expect(result instanceof Error).toBe(true);
      expect(result.name).toBe(data.name);
      expect(result.stack).toBe(data.stack);
      expect(result.message).toBe(data.message);
      expect(result.foo).toBe(data.foo);
    });
  });
});
