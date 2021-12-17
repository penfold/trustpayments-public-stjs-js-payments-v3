import { mock } from 'ts-mockito';
import { of } from 'rxjs';
import { DomMethods } from '../../../application/core/shared/dom-methods/DomMethods';
import { environment } from '../../../environments/environment';
import { ICardinal } from './ICardinal';
import { CardinalProvider } from './CardinalProvider';

describe('CardinalProvider', () => {
  const cardinal: ICardinal = mock<ICardinal>();
  let cardinalProvider: CardinalProvider;

  beforeEach(() => {
    DomMethods.insertScript = jest.fn().mockImplementation(() => {
      window.Cardinal = cardinal;

      return of(document.createElement('script'));
    });

    cardinalProvider = new CardinalProvider();
  });

  it('loads songbird live library when livestatus = 1', done => {
    cardinalProvider.getCardinal$(true).subscribe(result => {
      expect(window.Cardinal).toBe(cardinal);
      expect(result).toBe(cardinal);
      expect(DomMethods.insertScript).toHaveBeenCalledWith('head', {
        src: environment.CARDINAL_COMMERCE.SONGBIRD_LIVE_URL,
        id: 'cardinalCommerce',
      });
      done();
    });
  });

  it('loads songbird stage library when livestatus = 0', done => {
    cardinalProvider.getCardinal$(false).subscribe(result => {
      expect(window.Cardinal).toBe(cardinal);
      expect(result).toBe(cardinal);
      expect(DomMethods.insertScript).toHaveBeenCalledWith('head', {
        src: environment.CARDINAL_COMMERCE.SONGBIRD_TEST_URL,
        id: 'cardinalCommerce',
      });
      done();
    });
  });
});
