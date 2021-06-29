import jwt_decode from 'jwt-decode';
import { UnsignedJwtGenerator } from './UnsignedJwtGenerator';

describe('JwtGenerator', () => {
  let sut: UnsignedJwtGenerator;

  beforeAll(() => {
    sut = new UnsignedJwtGenerator();
  });

  describe('generate()', () => {
    it('should properly encode JWT from provided payload', () => {
      const payload = {
        field: 'fieldValue',
        field2: 2,
      };

      expect(sut.generate(payload)).toBe('eyJhbGciOiJub25lIn0.eyJmaWVsZCI6ImZpZWxkVmFsdWUiLCJmaWVsZDIiOjJ9.');
      expect(jwt_decode(sut.generate(payload))).toEqual(payload);
    });
  });
});
