import { Observable, switchMap } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Service } from 'typedi';
import { Uuid } from '../../../application/core/shared/uuid/Uuid';
import { environment } from '../../../environments/environment';
import { Locale } from '../../../application/core/shared/translator/Locale';
import { SrcAggregate } from './SrcAggregate';
import { IInitData } from './interfaces/IInitData';
import { IAggregatedProfiles } from './interfaces/IAggregatedProfiles';
import { IInitialCheckoutData } from './interfaces/IInitialCheckoutData';
import { ICheckoutResponse } from './ISrc';
import { CheckoutDataTransformer } from './CheckoutDataTransformer';
import { IdentificationFailureReason } from './IdentificationFailureReason';
import { IIdentificationResult } from './interfaces/IIdentificationResult';
import { IIdentificationData } from './interfaces/IIdentificationData';
import { IUserIdentificationService } from './interfaces/IUserIdentificationService';
import { LocaleProvider } from './LocaleProvider';

@Service()
export class DigitalTerminal {
  private idTokens: string[];
  private srciTransactionId: string;
  private srcProfiles: IAggregatedProfiles;
  private locale: Locale;

  constructor(
    private srcAggregate: SrcAggregate,
    private checkoutDataTransformer: CheckoutDataTransformer,
    private localeProvider: LocaleProvider,
  ) {
  }

  init(data: IInitData): Observable<void> {
    this.idTokens = [];
    this.srciTransactionId = Uuid.uuidv4();
    this.locale = this.localeProvider.getUserLocaleFromJwt();

    return this.srcAggregate.init({
      srciDpaId: data.srciDpaId,
      srcInitiatorId: environment.CLICK_TO_PAY.VISA.SRC_INITIATOR_ID,
      srciTransactionId: this.srciTransactionId,
      dpaTransactionOptions: {
        ...data.dpaTransactionOptions,
        dpaLocale: data.dpaTransactionOptions.dpaLocale || this.locale || 'en_GB',
      },
    });
  }

  isRecognized(): Observable<boolean> {
    return this.srcAggregate.isRecognized().pipe(
      tap(result => {
        this.idTokens = [...this.idTokens, ...result.idTokens];
      }),
      map(result => result.recognized)
    );
  }

  getSrcProfiles(): Observable<IAggregatedProfiles> {
    return this.srcAggregate.getSrcProfile(this.idTokens).pipe(
      tap(profiles => {
        this.srcProfiles = profiles;
      })
    );
  }

  identifyUser(userIdentificationService: IUserIdentificationService, identificationData: IIdentificationData): Observable<IIdentificationResult> {
    return userIdentificationService.identifyUser(this.srcAggregate, identificationData).pipe(
      tap(result => {
        this.idTokens.push(result.idToken);
      }),
      map(result => ({
        isSuccessful: Boolean(result.idToken),
        failureReason: IdentificationFailureReason.OTHER,
      }))
    );
  }

  checkout(data: IInitialCheckoutData): Observable<ICheckoutResponse> {
    return this.checkoutDataTransformer.transform(data, this.srciTransactionId, this.srcProfiles).pipe(
      switchMap(({ checkoutData, srcName }) => this.srcAggregate.checkout(srcName, checkoutData))
    );
  }

  unbindAppInstance(): Observable<undefined> {
    this.srcProfiles = {
      srcProfiles: {},
      aggregatedCards: [],
    };
    return this.srcAggregate.unbindAppInstance(this.idTokens);
  }
}
