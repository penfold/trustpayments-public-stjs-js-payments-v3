import { BehaviorSubject, combineLatest, NEVER, Observable, of, ReplaySubject, throwError } from 'rxjs';
import { Service } from 'typedi';
import { catchError, filter, map, switchMap, tap } from 'rxjs/operators';
import { ITranslator } from '../../../../application/core/shared/translator/ITranslator';
import { SrcAggregate } from '../../digital-terminal/SrcAggregate';
import { ICompleteIdValidationResponse, IInitiateIdentityValidationResponse } from '../../digital-terminal/ISrc';
import { IIdentificationData } from '../../digital-terminal/interfaces/IIdentificationData';
import { SrcName } from '../../digital-terminal/SrcName';
import { IUserIdentificationService } from '../../digital-terminal/interfaces/IUserIdentificationService';
import { IMessageBus } from '../../../../application/core/shared/message-bus/IMessageBus';
import { IHPPClickToPayAdapterInitParams } from './IHPPClickToPayAdapterInitParams';
import { HPPUpdateViewCallback } from './HPPUpdateViewCallback';
import { CTPSingInEmail } from './ctp-sing-in/CTPSingInEmail';
import { CTPSIgnInOTP } from './ctp-sing-in/CTPSingInOTP';

@Service()
export class HPPUserIdentificationService implements IUserIdentificationService {
  private initParams: IHPPClickToPayAdapterInitParams;
  private emailPrompt: CTPSingInEmail;
  private otpPrompt: CTPSIgnInOTP;
  private repeatTrigger$ = new BehaviorSubject(false);

  constructor(private translator: ITranslator,
              private messageBus: IMessageBus,
              private hppUpdateViewCallback: HPPUpdateViewCallback) {
    this.emailPrompt = new CTPSingInEmail(this.translator);
    this.otpPrompt = new CTPSIgnInOTP(this.translator);
  }

  setInitParams(initParams: IHPPClickToPayAdapterInitParams) {
    this.initParams = initParams;
    this.emailPrompt.setContainer(this.initParams.signInContainerId);
    this.otpPrompt.setContainer(this.initParams.signInContainerId);
  }

  identifyUser(
    srcAggregate: SrcAggregate,
    identificationData?: IIdentificationData
  ): Observable<ICompleteIdValidationResponse> {

    return this.repeatTrigger$.pipe(
      switchMap(forceEmailPrompt => {
        let emailSource: Observable<string>;
        const shouldAskForEmail = !identificationData?.email || !!forceEmailPrompt;
        if (shouldAskForEmail) {
          emailSource = this.askForEmail();
        } else {
          emailSource = of(identificationData.email);
        }

        return this.getSrcNameForEmail(emailSource, srcAggregate, shouldAskForEmail);
      }),
      switchMap(srcName => this.completeIdentification(srcName, srcAggregate))
    );
  }

  private showEmailError(errorResponse) {
    if (errorResponse?.error?.details) {
      this.emailPrompt.showError(errorResponse.error.details.map(e => e.message).join('\n'));
    }
  }

  private getSrcNameForEmail(emailSource: Observable<string>, srcAggregate: SrcAggregate, captureErrors: boolean): Observable<SrcName> {
    return emailSource.pipe(
      switchMap(email =>
        srcAggregate.identityLookup({
          type: 'EMAIL',
          identityValue: email,
        }).pipe(
          tap(result => {
            if (result?.consumerPresent === false) {
              this.emailPrompt.showError(this.getUnrecognizedEmailErrorMessage());
            }
          }),
          filter(result => result?.consumerPresent),
          map(result => result.srcNames[0]),
          catchError(errorResponse => {
            if (captureErrors) {
              this.showEmailError(errorResponse);
              return NEVER;
            } else {
              return throwError(errorResponse);
            }
          })
        )
      )
    );
  }

  private completeIdentification(srcName: SrcName, srcAggregate: SrcAggregate): Observable<ICompleteIdValidationResponse> {
    const codeSendTrigger = new BehaviorSubject<boolean>(true);

    return combineLatest([of(srcName), codeSendTrigger])
      .pipe(
        map(([srcName, trigger]) => srcName),
        switchMap(srcName =>
          srcAggregate.initiateIdentityValidation(srcName)
            .pipe(
              switchMap(validationResponse => this.askForCode(validationResponse, codeSendTrigger)),
              switchMap(code => srcAggregate.completeIdentityValidation(srcName, code)
                .pipe(
                  tap(() => this.emailPrompt.close()),
                  catchError(error => this.handleInvalidOTPCode(error))
                )
              )
            )
        )
      );
  }

  private handleInvalidOTPCode(error) {
    this.otpPrompt.showError(this.getInvalidOTPCodeMessage());
    return NEVER;
  }

  private askForEmail(): Observable<string> {
    this.hppUpdateViewCallback.callUpdateViewCallback({
      displayCardForm: true,
      displaySubmitButton: true,
      displayMaskedCardNumber: null,
      displayCardType: null,
    });

    return this.emailPrompt.show();
  }

  private askForCode(validationResponse: IInitiateIdentityValidationResponse, resendSubject: BehaviorSubject<boolean>): Observable<string> {
    const resultSubject = new ReplaySubject<string>();

    this.hppUpdateViewCallback.callUpdateViewCallback({
      displayCardForm: false,
      displaySubmitButton: false,
      displayMaskedCardNumber: null,
      displayCardType: null,
    });
    this.emailPrompt.close();

    this.otpPrompt.onCancel(() => this.repeatTrigger$.next(true));

    this.otpPrompt.show(validationResponse, resultSubject, resendSubject);
    return resultSubject;
  }

  private getUnrecognizedEmailErrorMessage(): string {
    return this.translator.translate('The email address you have entered is not registered for Click to Pay.');
  }

  private getInvalidOTPCodeMessage(): string {
    return this.translator.translate('The code you have entered is incorrect.');
  }
}
