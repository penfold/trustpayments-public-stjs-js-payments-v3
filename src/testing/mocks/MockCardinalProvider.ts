import { Service } from 'typedi';
import { Observable, of } from 'rxjs';
import { ICardinal } from '../../client/integrations/cardinal-commerce/ICardinal';
import { CardinalMock } from './CardinalMock';
import { ICardinalProvider } from '../../client/integrations/cardinal-commerce/ICardinalProvider';

@Service()
export class MockCardinalProvider implements ICardinalProvider {
  getCardinal$(liveStatus: boolean): Observable<ICardinal> {
    return of(new CardinalMock());
  }
}
