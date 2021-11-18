import { Service } from 'typedi';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IStRequest } from '../../../models/IStRequest';
import { IRequestProcessor } from '../IRequestProcessor';
import { FraudControlService } from '../../fraud-control/FraudControlService';

@Service()
export class FraudControlRequestProcessor implements IRequestProcessor {
  constructor(private fraudControlService: FraudControlService) {
  }

  process(requestData: IStRequest): Observable<IStRequest> {
    return this.fraudControlService.getTransactionId().pipe(
      map(fraudControlTid => {
        if (!fraudControlTid) {
          return requestData;
        }

        return {
          ...requestData,
          fraudcontroltransactionid: fraudControlTid,
        };
      }),
    );
  }
}
