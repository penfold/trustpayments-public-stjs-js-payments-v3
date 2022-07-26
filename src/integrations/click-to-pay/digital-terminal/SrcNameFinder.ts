import { Service } from 'typedi';
import { iinLookup } from '@trustpayments/ts-iin-lookup';
import { Observable, of } from 'rxjs';
import { SrcName } from './SrcName';

@Service()
export class SrcNameFinder {
  findSrcNameByPan(pan: string): Observable<SrcName | null> {
    const lookupResult = iinLookup.lookup(pan);

    switch (lookupResult.type) {
      case 'VISA':
        return of(SrcName.VISA);
      default:
        return of(null);
    }
  }
}
