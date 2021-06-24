import jwt_decode from 'jwt-decode';
import { JwtGenerator } from './JwtGenerator';

describe('JwtGenerator', () => {
  let sut: JwtGenerator;

  beforeAll(() => {
    sut = new JwtGenerator();
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
