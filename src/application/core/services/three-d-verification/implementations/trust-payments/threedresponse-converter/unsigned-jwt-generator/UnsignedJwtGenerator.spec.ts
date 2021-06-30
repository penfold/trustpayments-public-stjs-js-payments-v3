import jwt_decode from 'jwt-decode';
import { UnsignedJwtGenerator } from './UnsignedJwtGenerator';

describe('JwtGenerator', () => {
  let sut: UnsignedJwtGenerator;

  beforeAll(() => {
    sut = new UnsignedJwtGenerator();
  });

  describe('generate()', () => {
    it.each<any>([
      {
        payload: { field: 'fieldValue', field2: 2 },
        jwt: 'eyJhbGciOiJub25lIn0.eyJmaWVsZCI6ImZpZWxkVmFsdWUiLCJmaWVsZDIiOjJ9.',
      },
      {
        payload: { field: 'fieldValue', field2: 23 },
        jwt: 'eyJhbGciOiJub25lIn0.eyJmaWVsZCI6ImZpZWxkVmFsdWUiLCJmaWVsZDIiOjIzfQ.',
      },
      {
        payload: { field: 2 },
        jwt: 'eyJhbGciOiJub25lIn0.eyJmaWVsZCI6Mn0.',
      },
    ])('should properly encode JWT from provided payload', ({ payload, jwt }) => {
      expect(sut.generate(payload)).toBe(jwt);
      expect(jwt_decode(sut.generate(payload))).toEqual(payload);
    });
  });
});
