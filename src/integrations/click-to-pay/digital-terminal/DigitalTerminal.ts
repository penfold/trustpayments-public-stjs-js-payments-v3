import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Service } from 'typedi';
import { Uuid } from '../../../application/core/shared/uuid/Uuid';
import { environment } from '../../../environments/environment';
import { SrcAggregate } from './SrcAggregate';
import { IInitData } from './interfaces/IInitData';
import { IIdentificationData } from './interfaces/IIdentificationData';

@Service()
export class DigitalTerminal {
  private idTokens: string[];
  private srciTransactionId: string;

  constructor(private srcAggregate: SrcAggregate) {
  }

  init(data: IInitData): Observable<void> {
    this.idTokens = [];
    this.srciTransactionId = Uuid.uuidv4();

    return this.srcAggregate.init({
      srciDpaId: data.srciDpaId,
      srcInitiatorId: environment.CLICK_TO_PAY.VISA.SRC_INITIATOR_ID,
      srciTransactionId: this.srciTransactionId,
      dpaTransactionOptions: data.dpaTransactionOptions,
    });
  }

  isRecognized(): Observable<boolean> {
    return this.srcAggregate.isRecognized().pipe(
      tap(result => { this.idTokens = [...this.idTokens, ...result.idTokens] }),
      map(result => result.recognized),
      tap(() => console.log(this.idTokens)),
    );
  }

  identifyUser(identificationData: IIdentificationData): Observable<boolean> {
    return of(false);
  }
}
