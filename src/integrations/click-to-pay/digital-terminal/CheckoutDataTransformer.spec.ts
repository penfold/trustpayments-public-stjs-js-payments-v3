import { instance, mock, when } from 'ts-mockito';
import { of } from 'rxjs';
import { EncryptionKeyProvider } from './encrypt/EncryptionKeyProvider';
import { CardEncryptor } from './encrypt/CardEncryptor';
import { SrcNameFinder } from './SrcNameFinder';
import { CheckoutDataTransformer } from './CheckoutDataTransformer';
import { IAggregatedProfiles } from './interfaces/IAggregatedProfiles';
import { SrcName } from './SrcName';
import { IMaskedConsumer } from './ISrc';
import { ICorrelatedMaskedCard } from './interfaces/ICorrelatedMaskedCard';
import { IInitialCheckoutData } from './interfaces/IInitialCheckoutData';
import { IEncryptionKey } from './encrypt/IEncryptionKey';

describe('CheckoutDataTransformer', () => {
  let encryptionKeyProviderMock: EncryptionKeyProvider;
  let cardEncryptorMock: CardEncryptor;
  let srcNameFinderMock: SrcNameFinder;
  let checkoutDataTransformer: CheckoutDataTransformer;

  beforeEach(() => {
    encryptionKeyProviderMock = mock(EncryptionKeyProvider);
    cardEncryptorMock = mock(CardEncryptor);
    srcNameFinderMock = mock(SrcNameFinder);
    checkoutDataTransformer = new CheckoutDataTransformer(
      window,
      instance(encryptionKeyProviderMock),
      instance(cardEncryptorMock),
      instance(srcNameFinderMock)
    );
  });

  describe('transform()', () => {
    const srciTransactionId = 'foobar123';
    const profiles: IAggregatedProfiles = {
      srcProfiles: {
        [SrcName.VISA]: {
          srcCorrelationId: 'correlationid',
          profiles: [
            {
              idToken: 'idtoken',
              maskedConsumer: {} as IMaskedConsumer,
              maskedCards: [],
            },
          ],
        },
      },
      aggregatedCards: [
        {
          idToken: 'idtoken2',
          srcCorrelationId: 'correlationid2',
          srcDigitalCardId: '12345',
          srcName: SrcName.VISA,
        } as ICorrelatedMaskedCard,
      ],
    };

    it('adds existing card to checkout data', done => {
      const initialCheckoutData: IInitialCheckoutData = {
        consumer: null,
        dpaTransactionOptions: null,
        srcDigitalCardId: '12345',
      };

      checkoutDataTransformer.transform(initialCheckoutData, srciTransactionId, profiles).subscribe(result => {
        expect(result.srcName).toEqual(SrcName.VISA);
        expect(result.checkoutData).toEqual({
          ...initialCheckoutData,
          srciTransactionId,
          srcCorrelationId: 'correlationid2',
          idToken: 'idtoken2',
          windowRef: null,
        });
        done();
      });
    });

    it('adds encrypted new card to checkout data', done => {
      const initialCheckoutData: IInitialCheckoutData = {
        consumer: null,
        dpaTransactionOptions: null,
        windowRef: { name: 'foobar' } as Window,
        newCardData: {
          primaryAccountNumber: '4111111111111111',
          panExpirationMonth: '',
          cardSecurityCode: '',
          cardholderFullName: '',
          panExpirationYear: '',
        },
      };
      const encryptionKey: IEncryptionKey = { kid: 'foo',jwk: {  } };
      when(srcNameFinderMock.findSrcNameByPan('4111111111111111')).thenReturn(of(SrcName.VISA));
      when(encryptionKeyProviderMock.getEncryptionKey(SrcName.VISA)).thenReturn(of(encryptionKey));
      when(cardEncryptorMock.encrypt(initialCheckoutData.newCardData, encryptionKey)).thenReturn(of('encryptedcard'));

      checkoutDataTransformer.transform(initialCheckoutData, srciTransactionId, profiles).subscribe(result => {
        expect(result.srcName).toEqual(SrcName.VISA);
        expect(result.checkoutData).toEqual({
          srciTransactionId,
          consumer: null,
          dpaTransactionOptions: null,
          srcCorrelationId: 'correlationid',
          idToken: 'idtoken',
          encryptedCard: 'encryptedcard',
          windowRef: {
            name: 'foobar',
          },
        });
        done();
      });
    });
  });
});
