import { QueryParams } from '@sentry/types';
import { JwtMasker } from './JwtMasker';

describe('JwtMasker', () => {
  let jwtMasker: JwtMasker;
  const urls = [
    [
      'https://webservices.securetrading.net?foo=bar&jwt=somerandomvalueofjwt&xyz=abc',
      'https://webservices.securetrading.net?foo=bar&jwt=*****&xyz=abc',
    ],
    [
      'https://webservices.securetrading.net?jwt=somerandomvalueofjwt',
      'https://webservices.securetrading.net?jwt=*****',
    ],
    [
      'https://webservices.securetrading.net',
      'https://webservices.securetrading.net',
    ],
    [
      'https://webservices.securetrading.net?foo=bar&xyz=abc',
      'https://webservices.securetrading.net?foo=bar&xyz=abc',
    ],
  ];
  const queryParamsObjects = [
    [
      { jwt: 'somerandomvalueofjwt', foo: 'bar', xyx: 'abc' },
      { jwt: '*****', foo: 'bar', xyx: 'abc' },
    ],
    [
      { jwt: 'somerandomvalueofjwt' },
      { jwt: '*****' },
    ],
    [
      {},
      {},
    ],
    [
      { foo: 'bar', xyx: 'abc' },
      { foo: 'bar', xyx: 'abc' },
    ],
  ];

  const queryParamsArrays = [
    [
      [['foo', 'bar'], ['jwt', 'somerandomvalueofjwt'], ['xyz', 'abc']],
      [['foo', 'bar'], ['jwt', '*****'], ['xyz', 'abc']],
    ],
    [
      [['jwt', 'somerandomvalueofjwt']],
      [['jwt', '*****']],
    ],
    [
      [],
      [],
    ],
    [
      [['foo', 'bar'], ['xyz', 'abc']],
      [['foo', 'bar'], ['xyz', 'abc']],
    ],
  ];

  beforeEach(() => {
    jwtMasker = new JwtMasker();
  });

  it.each(urls)('should convert indicated value which equals string to a string', (unmasked: string, masked: string) => {
    expect(jwtMasker.mask(unmasked)).toEqual(masked);
  });

  it.each(queryParamsObjects)('should convert indicated value which equals object to object with changed jwt param', (unmasked: QueryParams, masked: QueryParams) => {
    expect(jwtMasker.mask(unmasked)).toEqual(masked);
  });

  it.each(queryParamsArrays)('should convert indicated value which equals array of arrays to array of arrays with changed jwt param', (unmasked: any, masked: any) => {
    expect(jwtMasker.mask(unmasked)).toEqual(masked);
  });
});
