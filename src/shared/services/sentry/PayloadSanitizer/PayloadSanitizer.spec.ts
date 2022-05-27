import { instance, mock, when } from 'ts-mockito';
import { JwtDecoder } from '../../jwt-decoder/JwtDecoder';
import { PayloadSanitizer } from './PayloadSanitizer';

describe('Payload Sanitizer', () => {
  let payloadSanitizer: PayloadSanitizer;
  let jwtDecoderMock: JwtDecoder;

  beforeEach(() => {
    jwtDecoderMock = mock(JwtDecoder);
    payloadSanitizer = new PayloadSanitizer(instance(jwtDecoderMock));
  });

  it('masks sensitive fields from jwt', () => {
    const jwt =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2NDAyMzQ4OTIsImlzcyI6ImpzbWFudWFsand0IiwicGF5bG9hZCI6eyJiYXNlYW1vdW50IjoiMTAwMCIsImFjY291bnR0eXBlZGVzY3JpcHRpb24iOiJFQ09NIiwiY3VycmVuY3lpc28zYSI6IkdCUCIsInNpdGVyZWZlcmVuY2UiOiJ0ZXN0X2pzbWFudWFsY2FyZGluYWw5MTkyMSIsInJlcXVlc3R0eXBlZGVzY3JpcHRpb25zIjpbIlRIUkVFRFFVRVJZIiwiQVVUSCJdLCJwYW4iOiI0MTExMTExMTExMTEifX0.OfJ8e3VxT3ARmAJQq1vMe-d3fnMkAbogcOwmpjhaHdU';
    when(jwtDecoderMock.decode(jwt)).thenReturn({
      payload: {
        accounttypedescription: 'ECOM',
        baseamount: '1000',
        currencyiso3a: 'GBP',
        pan: '1111111111111111',
        requesttypedescriptions: ['THREEDQUERY', 'AUTH'],
        sitereference: 'test_jsmanualcardinal91921',
        customerprefixname: 'test',
        customerfirstname: 'test',
        customermiddlename: 'test',
        customerlastname: 'test',
        customersuffixname: 'test',
      },
    });

    expect(payloadSanitizer.maskSensitiveJwtFields(jwt)).toEqual({
      payload: {
        accounttypedescription: 'ECOM',
        baseamount: '1000',
        currencyiso3a: 'GBP',
        pan: '***',
        requesttypedescriptions: ['THREEDQUERY', 'A*UTH'],
        sitereference: 'test_jsmanualcardinal91921',
        customerprefixname: '***',
        customerfirstname: '***',
        customermiddlename: '***',
        customerlastname: '***',
        customersuffixname: '***',
      },
    });
  });
});
