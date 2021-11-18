import { Inject, Service } from 'typedi';
import { from, Observable } from 'rxjs';
import { mapTo, switchMap, tap } from 'rxjs/operators';
import { IRequestProcessor } from '../IRequestProcessor';
import { IStRequest } from '../../../models/IStRequest';
import { IRequestProcessingOptions } from '../IRequestProcessingOptions';
import { IThreeDLookupResponse } from '../../../models/IThreeDLookupResponse';
import { PUBLIC_EVENTS } from '../../../models/constants/EventTypes';
import { ThreeDLookupRequest } from '../../three-d-verification/implementations/trust-payments/data/ThreeDLookupRequest';
import { TransportServiceGatewayClient } from '../../gateway-client/TransportServiceGatewayClient';
import { ThreeDSecureMethodService } from '../../three-d-verification/implementations/trust-payments/ThreeDSecureMethodService';
import { InterFrameCommunicator } from '../../../../../shared/services/message-bus/InterFrameCommunicator';
import { MERCHANT_PARENT_FRAME } from '../../../models/constants/Selectors';
import { IMessageBusEvent } from '../../../models/IMessageBusEvent';
import { IGatewayClient } from '../../gateway-client/IGatewayClient';

@Service()
export class ThreeDLookupRequestProcessor implements IRequestProcessor {
  constructor(
    @Inject(() => TransportServiceGatewayClient) private gatewayClient: IGatewayClient,
    private threeDSecureMethodService: ThreeDSecureMethodService,
    private interFrameCommunicator: InterFrameCommunicator,
  ) {
  }

  process(requestData: IStRequest, options: IRequestProcessingOptions): Observable<IStRequest> {
    return this.gatewayClient.threedLookup(new ThreeDLookupRequest(requestData)).pipe(
      tap(() => options.timer && options.timer.subscribe()),
      switchMap(response => {
        const queryEvent: IMessageBusEvent<string> = {
          type: PUBLIC_EVENTS.THREE_D_SECURE_PROCESSING_SCREEN_SHOW,
          data: response.paymenttypedescription,
        };

        return from(this.interFrameCommunicator.query(queryEvent, MERCHANT_PARENT_FRAME)).pipe(mapTo(response));
      }),
      switchMap((response: IThreeDLookupResponse) => this.threeDSecureMethodService.perform3DSMethod$(
        response.threedmethodurl,
        response.threednotificationurl,
        response.threedstransactionid,
      )),
      mapTo(requestData),
    );
  }
}
