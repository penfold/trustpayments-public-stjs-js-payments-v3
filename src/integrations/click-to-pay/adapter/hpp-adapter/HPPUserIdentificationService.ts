import { BehaviorSubject, combineLatest, NEVER, Observable, of, ReplaySubject, throwError } from 'rxjs';
import { Service } from 'typedi';
import { catchError, filter, map, mapTo, switchMap, tap } from 'rxjs/operators';
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

  // TODO add typings for errorResponse
  private showEmailError(errorResponse) {
    this.emailPrompt.showError(this.getErrorMessage(errorResponse));
  }

  private getErrorMessage(errorResponse): string {
    const hasErrorDetails = errorResponse?.error?.details?.some(error => error.message);
    const defaultUnknownErrorMessage = this.translator.translate('Something went wrong, try again or use another email.');

    switch (errorResponse.error?.reason) {
      case 'ACCT_INACCESSIBLE':
        return this.translator.translate('Account assigned to this email is currently not accessible');
      case 'CODE_EXPIRED':
        return this.translator.translate('OTP code has expired. Click "resend" to generate new code.');
      case 'CODE_INVALID':
        return this.translator.translate('The code you have entered is incorrect');
      case 'OTP_SEND_FAILED':
        return this.translator.translate('OTP code could not be sent.');
      case 'RETRIES_EXCEEDED':
        return this.translator.translate('The number of retries for generating the OTP exceeded the limit.');
      case 'ID_INVALID':
        return this.translator.translate('Invalid email. Use correct email and try again');
      case 'CONSUMER_ID_MISSING':
        return this.translator.translate('Consumer identity is missing in the request.');
      case 'VALIDATION_DATA_MISSING':
        return this.translator.translate('Validation data missing.');
      case 'ID_FORMAT_UNSUPPORTED':
        return this.translator.translate('Email is not in valid format.');
      case 'UNRECOGNIZED_CONSUMER_ID':
        return this.translator.translate('Consumer email could not be recognized.');
      case 'FRAUD':
        return this.translator.translate('The user account was locked or disabled.');
      default:
        return hasErrorDetails ? errorResponse.error.details.map(e => e.message).join('\n') : defaultUnknownErrorMessage;
    }
  }

  private getSrcNameForEmail(emailSource: Observable<string>, srcAggregate: SrcAggregate, captureErrors: boolean): Observable<SrcName> {
    return emailSource.pipe(
      switchMap(email => srcAggregate.unbindAppInstance().pipe(mapTo(email))),
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

  private handleInvalidOTPCode(errorResponse) {
    this.otpPrompt.showError(this.getErrorMessage(errorResponse));
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
}
