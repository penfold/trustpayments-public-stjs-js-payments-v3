import { Observable, of, throwError } from 'rxjs';
import { Service } from 'typedi';
import { environment } from '../../../../environments/environment';
import { SrcName } from '../SrcName';
import { IEncryptionKey } from './IEncryptionKey';
import { VISA_PEM } from './keys/visa';
import { MASTERCARD_PEM } from './keys/mastercard';

@Service()
export class EncryptionKeyProvider {
  getEncryptionKey(srcName: SrcName): Observable<IEncryptionKey> {
    switch (srcName) {
      case SrcName.VISA:
        return of({
          kid: environment.CLICK_TO_PAY.VISA.ENCRYPTION_KID,
          pem: VISA_PEM,
        });
      case SrcName.MASTERCARD:
        return of({
          kid: environment.CLICK_TO_PAY.MASTERCARD.ENCRYPTION_KID,
          pem:
            MASTERCARD_PEM as any,

        });
      default:
        return throwError(() => new Error(`Cannot find encryption key for SRC: ${srcName}`));
    }
  }
}
