import { IRequestProcessor } from '../IRequestProcessor';
import { Service } from 'typedi';
import { IStRequest } from '../../../models/IStRequest';
import { from, Observable } from 'rxjs';
import { Cybertonica } from '../../../integrations/cybertonica/Cybertonica';
import { map } from 'rxjs/operators';

@Service()
export class CybertonicaRequestProcessor implements IRequestProcessor {
  constructor(private cybertonica: Cybertonica) {
  }

  process(requestData: IStRequest): Observable<IStRequest> {
    return from(this.cybertonica.getTransactionId()).pipe(
      map(cybertonicaTid => {
        if (!cybertonicaTid) {
          return requestData;
        }

        return {
          ...requestData,
          fraudcontroltransactionid: cybertonicaTid,
        };
      }),
    );
  }
}
