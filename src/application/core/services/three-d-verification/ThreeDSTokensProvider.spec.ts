import { ThreeDSTokensProvider } from './ThreeDSTokensProvider';
import { instance, mock, verify, when } from 'ts-mockito';
import { of } from 'rxjs';
import { IGatewayClient } from '../gateway-client/IGatewayClient';
import { IMessageBus } from '../../shared/message-bus/IMessageBus';
import { SimpleMessageBus } from '../../shared/message-bus/SimpleMessageBus';
import { switchMap } from 'rxjs/operators';
import { PUBLIC_EVENTS } from '../../models/constants/EventTypes';

describe('ThreeDSTokensProvider', () => {
  let gatewayClientMock: IGatewayClient;
  let messageBus: IMessageBus;
  let tokensProvider: ThreeDSTokensProvider;

  const jsinitResponse = {
    cachetoken: 'foo',
    errorcode: '0',
    errormessage: '',
    requesttypedescription: 'JSINIT',
    threedinit: 'bar',
    transactionstartedtimestamp: '123456',
    jwt: '',
  };

  beforeEach(() => {
    gatewayClientMock = mock<IGatewayClient>();
    messageBus = new SimpleMessageBus();
    tokensProvider = new ThreeDSTokensProvider(
      instance(gatewayClientMock),
      messageBus,
    );

    when(gatewayClientMock.jsInit()).thenReturn(of(jsinitResponse));
  });

  describe('getTokens()', () => {
    it('performs the JSINIT request and returns tokens from the response', done => {
      tokensProvider.getTokens().subscribe(tokens => {
        expect(tokens.jwt).toBe('bar');
        expect(tokens.cacheToken).toBe('foo');
        done();
      });
    });

    it('doesnt make the second request when called getTokens() twice', done => {
      tokensProvider.getTokens().pipe(
        switchMap(() => tokensProvider.getTokens()),
      ).subscribe(tokens => {
        expect(tokens.jwt).toBe('bar');
        expect(tokens.cacheToken).toBe('foo');
        verify(gatewayClientMock.jsInit()).once();
        done();
      });
    });

    it('fetches new tokens on UPDATE_JWT event', done => {
      const secondJsinitResponse: typeof jsinitResponse = {
        ...jsinitResponse,
        cachetoken: 'foo2',
        threedinit: 'bar2',
      };

      when(gatewayClientMock.jsInit()).thenReturn(of(jsinitResponse), of(secondJsinitResponse));

      tokensProvider.getTokens().subscribe();

      messageBus.publish({ type: PUBLIC_EVENTS.UPDATE_JWT });

      tokensProvider.getTokens().subscribe(tokens => {
        expect(tokens).toEqual({
          cacheToken: 'foo2',
          jwt: 'bar2',
        });
        done();
      });
    });
  });
});
