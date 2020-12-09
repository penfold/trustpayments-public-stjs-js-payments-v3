import { DomMethods } from '../../../application/core/shared/dom-methods/DomMethods';
import { ICardinal } from './ICardinal';
import { CardinalProvider } from './CardinalProvider';
import { environment } from '../../../environments/environment';
import { mock } from 'ts-mockito';

describe('CardinalProvider', () => {
  const cardinal: ICardinal = mock<ICardinal>();

  let cardinalProvider: CardinalProvider;

  beforeEach(() => {
    DomMethods.insertScript = jest.fn().mockImplementation((target, options) => {
      (window as any).Cardinal = cardinal;

      return Promise.resolve(document.createElement('script'));
    });

    cardinalProvider = new CardinalProvider();
  });

  it('loads songbird live library when livestatus = 1', done => {
    cardinalProvider.getCardinal$(true).subscribe(result => {
      expect((window as any).Cardinal).toBe(cardinal);
      expect(result).toBe(cardinal);
      expect(DomMethods.insertScript).toHaveBeenCalledWith('head', {
        src: environment.CARDINAL_COMMERCE.SONGBIRD_LIVE_URL,
        id: 'cardinalCommerce'
      });
      done();
    });
  });

  it('loads songbird stage library when livestatus = 0', done => {
    cardinalProvider.getCardinal$(false).subscribe(result => {
      expect((window as any).Cardinal).toBe(cardinal);
      expect(result).toBe(cardinal);
      expect(DomMethods.insertScript).toHaveBeenCalledWith('head', {
        src: environment.CARDINAL_COMMERCE.SONGBIRD_TEST_URL,
        id: 'cardinalCommerce'
      });
      done();
    });
  });
});