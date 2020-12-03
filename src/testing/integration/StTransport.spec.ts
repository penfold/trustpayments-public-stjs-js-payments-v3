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

const customGlobal: GlobalWithFetchMock = (global as unknown) as GlobalWithFetchMock;
customGlobal.fetch = require('jest-fetch-mock');
customGlobal.fetchMock = customGlobal.fetch;

jest.mock('./../../application/core/shared/notification/Notification');

Container.set({ id: MessageBus, type: MessageBusMock });

describe('StTransport class', () => {
  const config: IConfig = {
    datacenterurl: 'https://webservices.securetrading.net/jwt/',
    jwt:
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhbTAzMTAuYXV0b2FwaSIsImlhdCI6MTYwNzAxMjYzMC4zNDM4MzM0LCJwYXlsb2FkIjp7ImJhc2VhbW91bnQiOiIxMDAwIiwiYWNjb3VudHR5cGVkZXNjcmlwdGlvbiI6IkVDT00iLCJjdXJyZW5jeWlzbzNhIjoiR0JQIiwic2l0ZXJlZmVyZW5jZSI6InRlc3RfamFtZXMzODY0MSIsInJlcXVlc3R0eXBlZGVzY3JpcHRpb25zIjpbIlRIUkVFRFFVRVJZIl0sInRocmVlZGJ5cGFzc2NhcmRzIjpbIlBJQkEiXX19.lDpwC-ZQubkkB57zwjwu6MaZr8G81dkDqBbhxAT0Sns'
  };

  // let configProviderMock = mock<ConfigProvider>();

  // const requestObject = {
  //   baseamount: '1000',
  //   accounttypedescription: 'ECOM',
  //   currencyiso3a: 'GBP',
  //   sitereference: 'test_james38641',
  //   termurl: 'https://termurl.com',
  //   fraudcontroltransactionid: '11fd2e75-3b90-44c1-6611-16de265b975f',
  //   pan: '4111111111111111',
  //   expirydate: '12/23',
  //   securitycode: '123'
  // };

  // beforeEach(() => {
  //   when(configProviderMock.getConfig()).thenReturn(config);
  // });

  // afterEach(() => {});

  describe('Header options', () => {
    beforeEach(() => {
      const testConfigProvider = new TestConfigProvider();

      Container.set(MessageBus, new MessageBusMock());
      Container.set(ConfigProvider, testConfigProvider);

      testConfigProvider.setConfig(config);
    });

    test('AUTH SUBSCRIPTION', done => {
      const gatewayClient = Container.get(GatewayClient);
      // const stTransport = new StTransport(new TestConfigProvider());
      // const messageBus = (new MessageBusMock() as unknown) as MessageBus;
      // const gatewayClient = new GatewayClient(stTransport, messageBus);

      gatewayClient.jsInit().subscribe(console.log);

      // console.log('a ten config jest taki', new TestConfigProvider())
      // const jwtKey = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhbTAzMTAuYXV0b2FwaSIsImlhdCI6MTYwNjk4MDU1OS44ODMzNzg3LCJwYXlsb2FkIjp7ImJhc2VhbW91bnQiOiIxMDAwIiwiYWNjb3VudHR5cGVkZXNjcmlwdGlvbiI6IkVDT00iLCJjdXJyZW5jeWlzbzNhIjoiR0JQIiwic2l0ZXJlZmVyZW5jZSI6InRlc3RfamFtZXMzODY0MSIsInJlcXVlc3R0eXBlZGVzY3JpcHRpb25zIjpbIlRIUkVFRFFVRVJZIl0sInRocmVlZGJ5cGFzc2NhcmRzIjpbIlBJQkEiXX19.U0vxSn1qaOoNcJ8HhF4NCqZUBAJzPwmd_Mp8pmt7H68';
      // const instance = new StTransport(new TestConfigProvider());
      // const requestTypes = ['AUTH', 'SUBSCRIPTION'];
      // const response = await instance.sendRequest({...requestObject});

      // console.log('AUTH SUBSCRIPTION', response)
    });
  });
});
