import { Service } from 'typedi';
import { Observable, of } from 'rxjs';
import { ICybertonica } from '../../application/core/integrations/cybertonica/ICybertonica';

@Service()
export class CybertonicaMock implements ICybertonica {
  private static TID_KEY = 'app.tid';
  private static readonly MOCKED_TID = '63d1d099-d635-41b6-bb82-96017f7da6bb';

  init(apiUserName: string): Observable<void> {
    return of(undefined);
  }

  getTransactionId(): Observable<string | null> {
    return of(CybertonicaMock.MOCKED_TID);
  }
}
