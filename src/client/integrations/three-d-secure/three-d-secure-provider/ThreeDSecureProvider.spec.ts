import { ThreeDSecureProvider } from './ThreeDSecureProvider';

describe('ThreeDSecureProvider', () => {
  let sut: ThreeDSecureProvider;

  beforeEach(() => {
    sut = new ThreeDSecureProvider();
  });

  describe('getSdk()', () => {
    it('should provide the ThreeDSecure instance', () => {
      const result = sut.getSdk();
      expect(result).toBeTruthy();
      expect(result.init$).toBeInstanceOf(Function);
      expect(result.run3DSMethod$).toBeInstanceOf(Function);
      expect(result.doChallenge$).toBeInstanceOf(Function);
      expect(result.getBrowserData).toBeInstanceOf(Function);
    });
  });
});
