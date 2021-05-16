import { Service } from 'typedi';
import { from, Observable, of } from 'rxjs';
import { IMessageBusEvent } from '../../../../models/IMessageBusEvent';
import { IMethodUrlData } from '../../../../../../client/integrations/three-d-secure/IMethodUrlData';
import { PUBLIC_EVENTS } from '../../../../models/constants/EventTypes';
import { MERCHANT_PARENT_FRAME } from '../../../../models/constants/Selectors';
import { MethodURLResultInterface } from '3ds-sdk-js';
import { InterFrameCommunicator } from '../../../../../../shared/services/message-bus/InterFrameCommunicator';

@Service()
export class ThreeDSecureMethodService {
  constructor(private interFrameCommunicator: InterFrameCommunicator) {
  }

  perform3DSMethod$(methodUrl: string, notificationUrl: string, transactionId: string): Observable<MethodURLResultInterface | undefined> {
    if (!methodUrl) {
      return of(undefined);
    }

    const queryEvent: IMessageBusEvent<IMethodUrlData> = {
      type: PUBLIC_EVENTS.THREE_D_SECURE_METHOD_URL,
      data: {
        methodUrl,
        notificationUrl,
        transactionId,
      },
    }

    return from(this.interFrameCommunicator.query<MethodURLResultInterface>(queryEvent, MERCHANT_PARENT_FRAME));
  }
}
