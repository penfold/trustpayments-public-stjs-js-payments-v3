import { GatewayClient } from '../GatewayClient';
import { ThreeDSTokensProvider } from './ThreeDSTokensProvider';
import { instance, mock, when } from 'ts-mockito';
import { of } from 'rxjs';

describe('ThreeDSTokensProvider', () => {
  let gatewayClientMock: GatewayClient;
  let tokensProvider: ThreeDSTokensProvider;

  beforeEach(() => {
    gatewayClientMock = mock(GatewayClient);
    tokensProvider = new ThreeDSTokensProvider(instance(gatewayClientMock));
  });

  it('performs the JSINIT request and returns tokens from the response', done => {
    when(gatewayClientMock.jsInit()).thenReturn(
      of({
        cachetoken: 'foo',
        errorcode: '0',
        errormessage: '',
        requesttypedescription: 'JSINIT',
        threedinit: 'bar',
        transactionstartedtimestamp: '123456'
      })
    );

    tokensProvider.getTokens().subscribe(tokens => {
      expect(tokens.jwt).toBe('bar');
      expect(tokens.cacheToken).toBe('foo');
      done();
    });
  });
});
