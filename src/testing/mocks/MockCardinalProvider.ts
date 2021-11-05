import { Service } from 'typedi';
import { Observable, of } from 'rxjs';
import { ICardinal } from '../../client/integrations/cardinal-commerce/ICardinal';
import { ICardinalProvider } from '../../client/integrations/cardinal-commerce/ICardinalProvider';
import { CardinalMock } from './CardinalMock';

@Service()
export class MockCardinalProvider implements ICardinalProvider {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getCardinal$(liveStatus: boolean): Observable<ICardinal> {
    return of(new CardinalMock());
  }
}
