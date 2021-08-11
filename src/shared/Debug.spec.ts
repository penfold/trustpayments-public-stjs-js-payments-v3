import { environment } from '../environments/environment';
import { Debug } from './Debug';

describe('Debug', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('error()', () => {
    it('runs console.error in non-production environment', () => {
      environment.production = false;
      Debug.error('some error');
      expect(console.error).toHaveBeenCalledWith('some error');
    });

    it('doesnt run console.error in production environment', () => {
      environment.production = true;
      Debug.error('some error');
      expect(console.error).not.toHaveBeenCalled();
    });
  });

  describe('warn()', () => {
    it('runs console.warn in non-production environment', () => {
      environment.production = false;
      Debug.warn('some warning');
      expect(console.warn).toHaveBeenCalledWith('some warning');
    });

    it('doesnt run console.warn in production environment', () => {
      environment.production = true;
      Debug.warn('some warning');
      expect(console.warn).not.toHaveBeenCalled();
    });
  });

  describe('log()', () => {
    it('runs console.log in non-production environment', () => {
      environment.production = false;
      Debug.log('some log');
      expect(console.log).toHaveBeenCalledWith('some log');
    });

    it('doesnt run console.log in production environment', () => {
      environment.production = true;
      Debug.log('some error');
      expect(console.log).not.toHaveBeenCalled();
    });
  });
});
