import { Observable, of, switchMap, throwError } from 'rxjs';
import { Inject, Service } from 'typedi';
import { map } from 'rxjs/operators';
import { WINDOW } from '../../../shared/dependency-injection/InjectionTokens';
import { IInitialCheckoutData } from './interfaces/IInitialCheckoutData';
import { IAggregatedProfiles } from './interfaces/IAggregatedProfiles';
import { ICheckoutData } from './ISrc';
import { SrcNameAndCheckoutData } from './interfaces/SrcNameAndCheckoutData';
import { ICardData } from './interfaces/ICardData';
import { EncryptionKeyProvider } from './encrypt/EncryptionKeyProvider';
import { CardEncryptor } from './encrypt/CardEncryptor';
import { SrcNameFinder } from './SrcNameFinder';

@Service()
export class CheckoutDataTransformer {
  constructor(
    @Inject(WINDOW) private window: Window,
    private encryptionKeyProvider: EncryptionKeyProvider,
    private cardEncryptor: CardEncryptor,
    private srcNameFinder: SrcNameFinder,
  ) {
  }

  transform(
    initialData: IInitialCheckoutData,
    srciTransactionId: string,
    aggregatedProfiles: IAggregatedProfiles,
  ): Observable<SrcNameAndCheckoutData> {
    const finalCheckoutData: Partial<ICheckoutData> = {
      srciTransactionId,
      dpaTransactionOptions: initialData.dpaTransactionOptions,
      consumer: initialData.consumer,
      windowRef: initialData.windowRef || null,
    };

    if (initialData.srcDigitalCardId) {
      return this.appendExistingCardData(finalCheckoutData, initialData.srcDigitalCardId, aggregatedProfiles);
    }

    return this.appendNewCardData(finalCheckoutData, initialData.newCardData, aggregatedProfiles);
  }

  private appendExistingCardData(
    checkoutData: Partial<ICheckoutData>,
    srcDigitalCardId: string,
    srcProfiles: IAggregatedProfiles,
  ): Observable<SrcNameAndCheckoutData> {
    const card = srcProfiles?.aggregatedCards.find(card => card.srcDigitalCardId === srcDigitalCardId);

    return of({
      srcName: card.srcName,
      checkoutData: {
        ...checkoutData,
        srcDigitalCardId,
        srcCorrelationId: card?.srcCorrelationId,
        idToken: card?.idToken,
      },
    });
  }

  private appendNewCardData(
    checkoutData: Partial<ICheckoutData>,
    cardData: ICardData,
    srcProfiles: IAggregatedProfiles,
  ): Observable<SrcNameAndCheckoutData> {
    return this.srcNameFinder.findSrcNameByPan(cardData.primaryAccountNumber).pipe(
      switchMap(srcName => {
        console.log(srcName)
        if (!srcName) {
          return throwError(() => new Error('Unknown or unsupported card type'));
        }

        const profile = srcProfiles?.srcProfiles[srcName];

        return this.encryptionKeyProvider.getEncryptionKey(srcName).pipe(
          switchMap(key => this.cardEncryptor.encrypt(cardData, key)),
          map(encryptedCard => ({
            srcName,
            checkoutData: {
              ...checkoutData,
              encryptedCard,
              srcCorrelationId: profile?.srcCorrelationId,
              idToken: profile?.profiles[0].idToken,
            },
          })),
        );
      }),
    );
  }
}
