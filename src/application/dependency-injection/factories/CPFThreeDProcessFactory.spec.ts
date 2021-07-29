import { IThreeDVerificationService } from '../../core/services/three-d-verification/IThreeDVerificationService';
import { IMessageBus } from '../../core/shared/message-bus/IMessageBus';
import { ThreeDSTokensProvider } from '../../core/services/three-d-verification/ThreeDSTokensProvider';
import { TransportServiceGatewayClient } from '../../core/services/gateway-client/TransportServiceGatewayClient';
import { VerificationResultHandler } from '../../core/services/three-d-verification/VerificationResultHandler';
import { mock } from 'ts-mockito';
import { CPFThreeDProcessFactory } from './CPFThreeDProcessFactory';
import { ThreeDProcess } from '../../core/services/three-d-verification/ThreeDProcess';

describe('CPFThreeDProcessFactory', () => {
  let verificationService: IThreeDVerificationService;
  let messageBus: IMessageBus;
  let tokenProvider: ThreeDSTokensProvider;
  let gatewayClient: TransportServiceGatewayClient;
  let verificationResultHandler: VerificationResultHandler;
  let cpfThreeDProcessFactory: CPFThreeDProcessFactory;

  beforeEach(() => {
    verificationService = mock(IThreeDVerificationService);
    messageBus = mock(IMessageBus);
    tokenProvider = mock(ThreeDSTokensProvider);
    gatewayClient = mock(TransportServiceGatewayClient);
    verificationResultHandler = mock(VerificationResultHandler);
    cpfThreeDProcessFactory = new CPFThreeDProcessFactory(
      verificationService,
      messageBus,
      tokenProvider,
      gatewayClient,
      verificationResultHandler,
    );
  });

  it('creates a new ThreeDProcess', () => {
    expect(cpfThreeDProcessFactory.create()).toBeInstanceOf(ThreeDProcess);
  });
});
