import { Observable } from 'rxjs';
import { GlobalWithFetchMock } from 'jest-fetch-mock';
import { mock, instance as mockInstance, when } from 'ts-mockito';
import { IConfig } from '../../shared/model/config/IConfig';
import { StTransport } from './../../application/core/services/st-transport/StTransport.class';
import { ConfigProvider } from './../../shared/services/config-provider/ConfigProvider';
import { TestConfigProvider } from './../mocks/TestConfigProvider';
import { GatewayClient } from './../../application/core/services/GatewayClient';
import { MessageBusMock } from '../mocks/MessageBusMock';
import { MessageBus } from '../../application/core/shared/message-bus/MessageBus';
import Container from 'typedi';
// import { JwtDecoder } from '../jwt-decoder/JwtDecoder';

const customGlobal: GlobalWithFetchMock = (global as unknown) as GlobalWithFetchMock;
customGlobal.fetch = require('jest-fetch-mock');
customGlobal.fetchMock = customGlobal.fetch;

jest.mock('./../../application/core/shared/notification/Notification');

Container.set({ id: MessageBus, type: MessageBusMock });

describe('StTransport class', () => {
  const config: IConfig = {
    datacenterurl: 'https://webservices.securetrading.net/jwt/',
    jwt:
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhbTAzMTAuYXV0b2FwaSIsImlhdCI6MTYwNzEwMDYyNy40NTUzNDQsInBheWxvYWQiOnsiYmFzZWFtb3VudCI6IjEwMDAiLCJhY2NvdW50dHlwZWRlc2NyaXB0aW9uIjoiRUNPTSIsImN1cnJlbmN5aXNvM2EiOiJHQlAiLCJzaXRlcmVmZXJlbmNlIjoidGVzdF9qYW1lczM4NjQxIiwicmVxdWVzdHR5cGVkZXNjcmlwdGlvbnMiOlsiVEhSRUVEUVVFUlkiXSwidGhyZWVkYnlwYXNzY2FyZHMiOlsiUElCQSJdfX0.8k-fCtqP1ad-i-Tt5lT0Rbe-yYMtHSyUlFbZs6zTO5M'
  };

  const requestObject = {
    baseamount: '1000',
    accounttypedescription: 'ECOM',
    currencyiso3a: 'GBP',
    sitereference: 'test_james38641',
    termurl: 'https://termurl.com',
    // fraudcontroltransactionid: '11fd2e75-3b90-44c1-6611-16de265b975f',
    pan: '4111111111111111',
    expirydate: '12/23',
    securitycode: '123'
  };

  describe('Header options', () => {
    beforeEach(() => {
      const testConfigProvider = new TestConfigProvider();

      Container.set(MessageBus, new MessageBusMock());
      Container.set(ConfigProvider, testConfigProvider);

      testConfigProvider.setConfig(config);
    });

    test('AUTH SUBSCRIPTION', done => {
      const requesttypedescriptions = ['SUBSCRIPTION', 'AUTH'];
      const gatewayClient = Container.get(GatewayClient);

      gatewayClient.jsInit().subscribe(({ cachetoken, errorcode }) => {
        if (Number(errorcode) === 0) {
          console.log({ cachetoken });
          gatewayClient.threedQuery({ ...requestObject, cachetoken: cachetoken }).subscribe({
            next: value => console.log({ value }),
            complete: () => done()
          });
        } else {
          console.log('jest blad', errorcode);
        }
      });
    });

    // test('ACCOUNTCHECK AUTH', done => {
    //   const requesttypedescriptions = ["ACCOUNTCHECK", "AUTH"];
    //   const gatewayClient = Container.get(GatewayClient);

    //   gatewayClient.jsInit().subscribe(({ cachetoken, errorcode }) => {
    //     if (Number(errorcode) === 0) {
    //       console.log({cachetoken})
    //       gatewayClient.threedQuery({...requestObject, cachetoken: cachetoken}).subscribe({
    //         next: (value) => console.log({value}),
    //         complete: () => done()
    //       })
    //     }
    //   });
    // });

    // test('RISKDEC_ACCOUNTCHECK_THREEDQUERY_AUTH', done => {
    //   const requesttypedescriptions = ["SUBSCRIPTION", "AUTH"];
    //   const gatewayClient = Container.get(GatewayClient);

    //   gatewayClient.jsInit().subscribe(({ cachetoken, errorcode }) => {
    //     if (Number(errorcode) === 0) {
    //       console.log({cachetoken})
    //       gatewayClient.threedQuery({...requestObject, cachetoken: cachetoken}).subscribe({
    //         next: (value) => console.log({value}),
    //         complete: () => done()
    //       })
    //     }
    //   });
    // });

    // test('RISKDEC_ACCOUNTCHECK_THREEDQUERY_AUTH_SUBSCRIPTION', done => {
    //   const requesttypedescriptions = ["SUBSCRIPTION", "AUTH"];
    //   const gatewayClient = Container.get(GatewayClient);

    //   gatewayClient.jsInit().subscribe(({ cachetoken, errorcode }) => {
    //     if (Number(errorcode) === 0) {
    //       console.log({cachetoken})
    //       gatewayClient.threedQuery({...requestObject, cachetoken: cachetoken}).subscribe({
    //         next: (value) => console.log({value}),
    //         complete: () => done()
    //       })
    //     }
    //   });
    // });

    // test('threequery and bypass', done => {
    //   const requesttypedescriptions = ["SUBSCRIPTION", "AUTH"];
    //   const gatewayClient = Container.get(GatewayClient);

    //   gatewayClient.jsInit().subscribe(({ cachetoken, errorcode }) => {
    //     if (Number(errorcode) === 0) {
    //       console.log({cachetoken})
    //       gatewayClient.threedQuery({...requestObject, cachetoken: cachetoken}).subscribe({
    //         next: (value) => console.log({value}),
    //         complete: () => done()
    //       })
    //     }
    //   });
    // });
  });
});
