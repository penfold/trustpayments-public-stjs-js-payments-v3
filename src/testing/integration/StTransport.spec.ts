import { StTransport } from './../../application/core/services/st-transport/StTransport.class';
import { ConfigProvider } from './../../shared/services/config-provider/ConfigProvider';
import { TestConfigProvider } from './../mocks/TestConfigProvider';
import { GatewayClient } from './../../application/core/services/GatewayClient';
import { MessageBusMock } from '../mocks/MessageBusMock';
import { MessageBus } from '../../application/core/shared/message-bus/MessageBus';
import Container from 'typedi';

describe('StTransport class', () => {
  const datacenterurl: string = 'https://webservices.securetrading.net/jwt/';

  const requestObject = {
    baseamount: '1000',
    accounttypedescription: 'ECOM',
    currencyiso3a: 'GBP',
    sitereference: 'test_james38641',
    termurl: 'https://termurl.com',
    pan: '4111111111111111',
    expirydate: '12/23',
    securitycode: '123'
  };

  describe('GatewayClient', () => {
    describe('for selected request types should return a response where:', () => {
      let gatewayClient: GatewayClient;
      let testConfigProvider: TestConfigProvider;

      beforeEach(() => {
        testConfigProvider = new TestConfigProvider();
        const stTransport = new StTransport(testConfigProvider);
        const messageBus = (new MessageBusMock() as unknown) as MessageBus;
        gatewayClient = new GatewayClient(stTransport, messageBus);
      });

      test('AUTH passed, SUBSCRIPTION failed', done => {
        const jwt =
          'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhbTAzMTAuYXV0b2FwaSIsImlhdCI6MTYwNzMxOTc1My43MTY5MiwicGF5bG9hZCI6eyJiYXNlYW1vdW50IjoiMTAwMCIsImFjY291bnR0eXBlZGVzY3JpcHRpb24iOiJFQ09NIiwiY3VycmVuY3lpc28zYSI6IkdCUCIsInNpdGVyZWZlcmVuY2UiOiJ0ZXN0X2phbWVzMzg2NDEiLCJyZXF1ZXN0dHlwZWRlc2NyaXB0aW9ucyI6WyJBVVRIIiwiU1VCU0NSSVBUSU9OIl0sInRocmVlZGJ5cGFzc3BheW1lbnR0eXBlcyI6WyJWSVNBIl19fQ.pdIHxc6P4h7QWh_uzUfpxLU10TpqtY7eEm-Cgda32cA';

        testConfigProvider.setConfig({ datacenterurl, jwt });
        Container.set(ConfigProvider, testConfigProvider);

        gatewayClient.jsInit().subscribe(({ cachetoken, errorcode }) => {
          if (Number(errorcode) === 0) {
            gatewayClient.threedQuery({ ...requestObject, cachetoken }).subscribe({
              next: ({ customeroutput, errordata, errorcode }) => {
                expect(customeroutput).toBe('TRYAGAIN');
                expect(errordata).toContain('subscriptionnumber');
                expect(errorcode).toBe('30000');
              },
              complete: () => done()
            });
          }
        });
      });

      test('AUTH passed, ACCOUNTCHECK failed', done => {
        const jwt =
          'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhbTAzMTAuYXV0b2FwaSIsImlhdCI6MTYwNzMxOTgwMy42NTIwNjI0LCJwYXlsb2FkIjp7ImJhc2VhbW91bnQiOiIxMDAwIiwiYWNjb3VudHR5cGVkZXNjcmlwdGlvbiI6IkVDT00iLCJjdXJyZW5jeWlzbzNhIjoiR0JQIiwic2l0ZXJlZmVyZW5jZSI6InRlc3RfamFtZXMzODY0MSIsInJlcXVlc3R0eXBlZGVzY3JpcHRpb25zIjpbIkFVVEgiLCJBQ0NPVU5UQ0hFQ0siXX19.txa1c9xyT3wXGmyvS3gCv686D8LSq_yLZw5lHFFY-os';

        testConfigProvider.setConfig({ datacenterurl, jwt });
        Container.set(ConfigProvider, testConfigProvider);

        gatewayClient.jsInit().subscribe(({ cachetoken, errorcode }) => {
          if (Number(errorcode) === 0) {
            gatewayClient.threedQuery({ ...requestObject, cachetoken }).subscribe({
              next: ({ customeroutput, errordata, errorcode }) => {
                expect(customeroutput).toBeUndefined();
                expect(errordata).toContain('requesttypedescriptions');
                expect(errorcode).toBe('30000');
              },
              complete: () => done()
            });
          }
        });
      });

      test('RISKDEC / ACCOUNTCHECK / THREEDQUERY / AUTH passed', done => {
        const jwt =
          'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhbTAzMTAuYXV0b2FwaSIsImlhdCI6MTYwNzMyMDg4Mi4yMzYyOTY0LCJwYXlsb2FkIjp7ImJhc2VhbW91bnQiOiIxMDAwIiwiYWNjb3VudHR5cGVkZXNjcmlwdGlvbiI6IkVDT00iLCJjdXJyZW5jeWlzbzNhIjoiR0JQIiwic2l0ZXJlZmVyZW5jZSI6InRlc3RfamFtZXMzODY0MSIsInJlcXVlc3R0eXBlZGVzY3JpcHRpb25zIjpbIlJJU0tERUMiLCJBQ0NPVU5UQ0hFQ0siLCJUSFJFRURRVUVSWSIsIkFVVEgiXX19.7U305bzgKJvnJOfyirJi8ZGFk3kO6HGiAndMIHWZAP0';

        testConfigProvider.setConfig({ datacenterurl, jwt });
        Container.set(ConfigProvider, testConfigProvider);

        gatewayClient.jsInit().subscribe(({ cachetoken, errorcode }) => {
          if (Number(errorcode) === 0) {
            gatewayClient.threedQuery({ ...requestObject, cachetoken }).subscribe({
              next: response => {
                expect(response.requesttypedescription).toBe('THREEDQUERY');
                expect(response.paymenttypedescription).toBe('VISA');
                expect(response.customeroutput).toBe('THREEDREDIRECT');
                expect(response.errormessage).toBe('Payment has been successfully processed');
              },
              complete: () => done()
            });
          }
        });
      });

      test('RISKDEC / ACCOUNTCHECK / AUTH passed, THREEDQUERY bypassed', done => {
        const jwt =
          'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhbTAzMTAuYXV0b2FwaSIsImlhdCI6MTYwNzMyMDAwNS42MTg1ODc3LCJwYXlsb2FkIjp7ImJhc2VhbW91bnQiOiIxMDAwIiwiYWNjb3VudHR5cGVkZXNjcmlwdGlvbiI6IkVDT00iLCJjdXJyZW5jeWlzbzNhIjoiR0JQIiwic2l0ZXJlZmVyZW5jZSI6InRlc3RfamFtZXMzODY0MSIsInJlcXVlc3R0eXBlZGVzY3JpcHRpb25zIjpbIlJJU0tERUMiLCJBQ0NPVU5UQ0hFQ0siLCJUSFJFRURRVUVSWSIsIkFVVEgiLCJTVUJTQ1JJUFRJT04iXSwidGhyZWVkYnlwYXNzcGF5bWVudHR5cGVzIjpbIlZJU0EiXX19.XR5sjmYnUwImRUTVY5BE49lJr01nXlkgBX_HgZDzSfc';

        testConfigProvider.setConfig({ datacenterurl, jwt });
        Container.set(ConfigProvider, testConfigProvider);

        gatewayClient.jsInit().subscribe(({ cachetoken, errorcode }) => {
          if (Number(errorcode) === 0) {
            gatewayClient.threedQuery({ ...requestObject, cachetoken }).subscribe({
              next: response => {
                expect(response.requesttypedescription).toBe('ACCOUNTCHECK');
                expect(response.paymenttypedescription).toBe('VISA');
                expect(response.customeroutput).toBe('RESULT');
                expect(response.errormessage).toBe('Payment has been successfully processed');
              },
              complete: () => done()
            });
          }
        });
      });

      test('THREEDQUERY failed (bypass card)', done => {
        const jwt =
          'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhbTAzMTAuYXV0b2FwaSIsImlhdCI6MTYwNzMyMDI4Ni42MDg2OTAzLCJwYXlsb2FkIjp7ImJhc2VhbW91bnQiOiIxMDAwIiwiYWNjb3VudHR5cGVkZXNjcmlwdGlvbiI6IkVDT00iLCJjdXJyZW5jeWlzbzNhIjoiR0JQIiwic2l0ZXJlZmVyZW5jZSI6InRlc3RfamFtZXMzODY0MSIsInJlcXVlc3R0eXBlZGVzY3JpcHRpb25zIjpbIlRIUkVFRFFVRVJZIl0sInRocmVlZGJ5cGFzc3BheW1lbnR0eXBlcyI6WyJWSVNBIl19fQ.ns3JUnc5CCIQtZIH2qWLyyAyyNuaemOnTBJ4gWXOZcM';

        testConfigProvider.setConfig({ datacenterurl, jwt });
        Container.set(ConfigProvider, testConfigProvider);

        gatewayClient.jsInit().subscribe(({ cachetoken, errorcode }) => {
          if (Number(errorcode) === 0) {
            gatewayClient.threedQuery({ ...requestObject, cachetoken }).subscribe({
              next: response => {
                expect(response.requesttypedescription).toBe('ERROR');
                expect(response.customeroutput).toBe('TRYAGAIN');
                expect(response.errorcode).toBe('22000');
                expect(response.errormessage).toBe('Bypass');
              },
              complete: () => done()
            });
          }
        });
      });
    });
  });
});
