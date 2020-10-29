import { JwtDecoder } from './JwtDecoder';

describe('JwtDecoder', () => {
  let decoder: JwtDecoder;

  beforeEach(() => {
    decoder = new JwtDecoder();
  });

  it('decodes the jwt string', () => {
    const jwt =
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhbTAzMTAuYXV0b2FwaSIsImlhdCI6MTYwMzQ2ODQ2OS4xMTc0OTYsInBheWxvYWQiOnsiYmFzZWFtb3VudCI6IjIwMDAiLCJhY2NvdW50dHlwZWRlc2NyaXB0aW9uIjoiRUNPTSIsImN1cnJlbmN5aXNvM2EiOiJHQlAiLCJzaXRlcmVmZXJlbmNlIjoidGVzdCJ9fQ.ffnY-Pf3u0jgsKxEkI-_JcefbCRQYts1hePUm-gwEjo';
    const result = decoder.decode(jwt);

    expect(result).toEqual({
      iss: 'am0310.autoapi',
      iat: 1603468469.117496,
      payload: {
        baseamount: '2000',
        accounttypedescription: 'ECOM',
        currencyiso3a: 'GBP',
        sitereference: 'test'
      }
    });
  });

  it('throws an error when the JWT cannot be parsed', () => {
    expect(() => decoder.decode('invalid-jwt')).toThrowError('Invalid JWT, cannot parse: invalid-jwt.');
  });

  it('throws an error when parsing undefined or empty string', () => {
    expect(() => decoder.decode(undefined)).toThrowError('Invalid JWT, undefined or empty string.');
    expect(() => decoder.decode('')).toThrowError('Invalid JWT, undefined or empty string.');
  });
});
