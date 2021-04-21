import { from, Observable } from 'rxjs';
import { Service } from 'typedi';
import { IInitializationData } from '../../../../../../client/integrations/cardinal-commerce/data/IInitializationData';
import { InterFrameCommunicator } from '../../../../../../shared/services/message-bus/InterFrameCommunicator';
import { PUBLIC_EVENTS } from '../../../../models/constants/EventTypes';
import { MERCHANT_PARENT_FRAME } from '../../../../models/constants/Selectors';
import { IMessageBusEvent } from '../../../../models/IMessageBusEvent';
import { IVerificationData } from '../../data/IVerificationData';
import { IVerificationResult } from '../../data/IVerificationResult';
import { IThreeDVerificationService } from '../../IThreeDVerificationService';

@Service()
export class ThreeDSecureVerificationService implements IThreeDVerificationService {
  constructor(private interFrameCommunicator: InterFrameCommunicator) {}

  init(jwt: string): Observable<void> {
    const queryEvent: IMessageBusEvent<IInitializationData> = {
      type: PUBLIC_EVENTS.THREE_D_SECURE_SETUP,
      data: { jwt },
    };

    return from(this.interFrameCommunicator.query<void>(queryEvent, MERCHANT_PARENT_FRAME));
  }

  binLookup(pan: string): Observable<void> {
    const queryEvent: IMessageBusEvent<string> = {
      type: PUBLIC_EVENTS.THREE_D_SECURE_TRIGGER,
      data: pan,
    };

    return from(this.interFrameCommunicator.query<void>(queryEvent, MERCHANT_PARENT_FRAME));
  }

  start(jwt: string): Observable<any> {
    const queryEvent: IMessageBusEvent<IInitializationData> = {
      type: PUBLIC_EVENTS.THREE_D_SECURE_START,
      data: { jwt },
    };

    return from(this.interFrameCommunicator.query<void>(queryEvent, MERCHANT_PARENT_FRAME));
  }

  verify(data: IVerificationData): Observable<IVerificationResult> {
    const queryEvent: IMessageBusEvent<IVerificationData> = {
      type: PUBLIC_EVENTS.THREE_D_SECURE_VERIFY,
      data,
    };

    return from(this.interFrameCommunicator.query<IVerificationResult>(queryEvent, MERCHANT_PARENT_FRAME));
  }
}
