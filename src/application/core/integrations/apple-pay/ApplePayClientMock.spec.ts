import { ApplePayClientMock } from './ApplePayClientMock';
import { ApplePayClientStatus } from './ApplePayClientStatus';

describe('ApplePayClientMock', () => {
  let applePayClientMock: ApplePayClientMock;

  beforeAll(() => {
    applePayClientMock = new ApplePayClientMock();
  });

  it(`init$() should return default ${ApplePayClientStatus.SUCCESS} status`, done => {
    applePayClientMock.init$().subscribe(result => {
      expect(result).toBe(ApplePayClientStatus.SUCCESS);
      done();
    });
  });
});
