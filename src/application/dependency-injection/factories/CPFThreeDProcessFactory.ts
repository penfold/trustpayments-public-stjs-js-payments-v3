import { ThreeDProcess } from '../../core/services/three-d-verification/ThreeDProcess';
import { IThreeDVerificationService } from '../../core/services/three-d-verification/IThreeDVerificationService';
import { IMessageBus } from '../../core/shared/message-bus/IMessageBus';
import { ThreeDSTokensProvider } from '../../core/services/three-d-verification/ThreeDSTokensProvider';
import { VerificationResultHandler } from '../../core/services/three-d-verification/VerificationResultHandler';
import { TransportServiceGatewayClient } from '../../core/services/gateway-client/TransportServiceGatewayClient';
import { Service } from 'typedi';

@Service()
export class CPFThreeDProcessFactory {
  constructor(
    private verificationService: IThreeDVerificationService,
    private messageBus: IMessageBus,
    private tokenProvider: ThreeDSTokensProvider,
    private gatewayClient: TransportServiceGatewayClient,
    private verificationResultHandler: VerificationResultHandler
  ) {}

  create(): ThreeDProcess {
    return new ThreeDProcess(
      this.verificationService,
      this.messageBus,
      this.tokenProvider,
      this.gatewayClient,
      this.verificationResultHandler,
    );
  }
}
