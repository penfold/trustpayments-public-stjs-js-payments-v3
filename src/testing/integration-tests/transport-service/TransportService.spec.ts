import { TransportService } from '../../../application/core/services/st-transport/TransportService';
import { Container } from 'typedi';
import { MessageBusToken, StoreToken } from '../../../shared/dependency-injection/InjectionTokens';
import { Store } from '../../../application/core/store/store/Store';
import { JwtReducer } from '../../../application/core/store/reducers/jwt/JwtReducer';
import { IMessageBus } from '../../../application/core/shared/message-bus/IMessageBus';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { JwtDecoder } from '../../../shared/services/jwt-decoder/JwtDecoder';

describe('TransportService', () => {
  let transportService: TransportService;
  let store: Store<any>;
  let messageBus: IMessageBus;
  let jwtDecoder: JwtDecoder;

  beforeAll(() => {
    transportService = Container.get(TransportService);
    messageBus = Container.get(MessageBusToken);
    store = Container.get(StoreToken) as Store<any>;
    store.addReducer(Container.get(JwtReducer));
    jwtDecoder = Container.get(JwtDecoder);
  });

  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('sends JSINIT request and updates the current JWT in the store', done => {
    const jwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2MTY3NjI4MDcsImlzcyI6ImpzbGlicmFyeWp3dCIsInBheWxvYWQiOnsibWFpbmFtb3VudCI6IjIwLjAwIiwiYWNjb3VudHR5cGVkZXNjcmlwdGlvbiI6IkVDT00iLCJjdXJyZW5jeWlzbzNhIjoiR0JQIiwic2l0ZXJlZmVyZW5jZSI6InRlc3RfamFtZXMzODY0MSIsInJlcXVlc3R0eXBlZGVzY3JpcHRpb25zIjpbIlRIUkVFRFFVRVJZIiwiQVVUSCJdfX0.HBtDAiRxSUb58hgkuVVwIMbPZ5IfJEWJJmQ3oiOcj_s';

    messageBus.publish({ type: PUBLIC_EVENTS.JWT_REPLACED, data: jwt });

    transportService.sendRequest({ requesttypedescriptions: ['JSINIT'] }).subscribe(response => {
      expect(response).toEqual({
        transactionstartedtimestamp: expect.any(String),
        errormessage: 'Ok',
        cachetoken: expect.any(String),
        errorcode: '0',
        requesttypedescription: 'JSINIT',
        threedinit: expect.any(String),
        customeroutput: 'RESULT',
        jwt: expect.any(String),
      });

      const newJwt = store.getState().jwt;

      expect(newJwt).not.toBe(jwt);
      expect(jwtDecoder.decode(newJwt).payload).toEqual(jwtDecoder.decode(jwt).payload);
      done();
    });
  });
});
