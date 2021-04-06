import { Service } from 'typedi';
import { from, merge, Observable } from 'rxjs';
import { filter, map, first } from 'rxjs/operators';
import { IMessageBus } from '../../../application/core/shared/message-bus/IMessageBus';
import { RequestType } from '../../../shared/types/RequestType';
import { ofType } from '../../../shared/services/message-bus/operators/ofType';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { IMessageBusEvent } from '../../../application/core/models/IMessageBusEvent';
import { TERM_URL } from '../../../application/core/models/constants/RequestData';
import { TransportService } from '../../../application/core/services/st-transport/TransportService';

@Service()
export class GooglePayPaymentService {
  constructor(private transportService: TransportService, private messageBus: IMessageBus) {}

  processPayment(requestTypes: RequestType[], formData: object, payment: any): Observable<any> {
    const bypassError$ = this.messageBus.pipe(
      ofType(PUBLIC_EVENTS.TRANSACTION_COMPLETE),
      filter((event: IMessageBusEvent) => {
        if (Number(event.data.errorcode) === 22000 || Number(event.data.errorcode) === 50003) {
          return event.data;
        }
      }),
      map((event: { data: any }) => event.data)
    );

    const processPayment$ = from(
      // this.payment.processPayment(
      this.transportService.sendRequest({
        requestTypes,
        walletsource: 'GOOGLEPAY',
        wallettoken: JSON.stringify(payment),
        ...formData,
        termurl: TERM_URL
      })
    ).pipe(
      map((data: any) => {
        if (!data.response.errorcode) {
          return {
            ...data.response,
            errormessage: 'An error occured',
            errorcode: 'Error'
          };
        }
        return data.response;
      })
    );

    return merge(processPayment$, bypassError$).pipe(first());
  }
}
