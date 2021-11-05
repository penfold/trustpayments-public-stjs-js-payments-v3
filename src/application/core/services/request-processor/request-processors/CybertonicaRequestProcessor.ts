import { Service } from 'typedi';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IRequestProcessor } from '../IRequestProcessor';
import { IStRequest } from '../../../models/IStRequest';
import { Cybertonica } from '../../../integrations/cybertonica/Cybertonica';

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
