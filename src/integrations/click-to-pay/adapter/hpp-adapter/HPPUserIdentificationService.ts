import { BehaviorSubject, combineLatest, NEVER, Observable, of, ReplaySubject } from 'rxjs';
import { Service } from 'typedi';
import { catchError, filter, map, switchMap, tap } from 'rxjs/operators';
import { ITranslator } from '../../../../application/core/shared/translator/ITranslator';
import { SrcAggregate } from '../../digital-terminal/SrcAggregate';
import { ICompleteIdValidationResponse, IInitiateIdentityValidationResponse } from '../../digital-terminal/ISrc';
import { IIdentificationData } from '../../digital-terminal/interfaces/IIdentificationData';
import { SrcName } from '../../digital-terminal/SrcName';
import { IUserIdentificationService } from '../../digital-terminal/interfaces/IUserIdentificationService';
import { IMessageBus } from '../../../../application/core/shared/message-bus/IMessageBus';
import { IUpdateView } from '../interfaces/IUpdateView';
import { untilDestroy } from '../../../../shared/services/message-bus/operators/untilDestroy';
import { HPPCTPUserPromptFactory } from './HPPCTPUserPromptFactory';
import { HPPCTPUserPromptService } from './HPPCTPUserPromptService';
import { IHPPClickToPayAdapterInitParams } from './IHPPClickToPayAdapterInitParams';

@Service()
export class HPPUserIdentificationService implements IUserIdentificationService {
  private initParams: IHPPClickToPayAdapterInitParams;
  private onUpdateViewCallback: (data: IUpdateView) => void;

  constructor(private hppCTPUserPromptService: HPPCTPUserPromptService,
              private hppCTPUserPromptFactory: HPPCTPUserPromptFactory,
              private translator: ITranslator,
              private messageBus: IMessageBus) {
    this.hppCTPUserPromptService.getStateChanges().pipe(
      filter(value => value === false),
      untilDestroy(this.messageBus)
    ).subscribe(() =>
      this.callUpdateViewCallback(true)
    );
  }

  setInitParams(initParams: IHPPClickToPayAdapterInitParams) {
    this.initParams = initParams;
    this.onUpdateViewCallback = initParams.onUpdateView;
  }

  identifyUser(
    srcAggregate: SrcAggregate,
    identificationData?: IIdentificationData
  ): Observable<ICompleteIdValidationResponse> {
    let emailSource: Observable<string>;

    if (identificationData?.email) {
      emailSource = of(identificationData.email);
    } else {
      emailSource = this.askForEmail();
    }

    return this.getSrcNameForEmail(emailSource, srcAggregate).pipe(
      switchMap(srcName => this.completeIdentification(srcName, srcAggregate))
    );
  }

  private getSrcNameForEmail(emailSource: Observable<string>, srcAggregate: SrcAggregate): Observable<SrcName> {
    return emailSource.pipe(
      switchMap(email =>
        srcAggregate.identityLookup({
          type: 'EMAIL',
          identityValue: email,
        }).pipe(
          tap(result => {
            if (result?.consumerPresent === false) {
              this.hppCTPUserPromptService.clearNotifications();
              this.hppCTPUserPromptService.showNotification(this.getUnrecognizedEmailErrorMessage());
            } else {
              this.hppCTPUserPromptService.clearNotifications();
            }
          }),
          filter(result => result?.consumerPresent),
          map(result => result.srcNames[0])
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
                  tap(console.log),
                  tap(() => this.hppCTPUserPromptService.hide()),
                  catchError(error => this.handleInvalidOTPCode(error))
                )
              ),
            )
        )
      );
  }

  private handleInvalidOTPCode(error) {
    this.hppCTPUserPromptService.clearNotifications();
    this.hppCTPUserPromptService.showNotification(this.getInvalidOTPCodeMessage());
    return NEVER;
  }

  private askForEmail(): Observable<string> {
    const result = new ReplaySubject<string>();
    const formElement = this.hppCTPUserPromptFactory.createEmailForm(result);

    this.callUpdateViewCallback(false);
    this.hppCTPUserPromptService.show(formElement, this.getTargetElement());

    return result.asObservable();
  }

  private askForCode(validationResponse: IInitiateIdentityValidationResponse, resendSubject: BehaviorSubject<boolean>): Observable<string> {
    const result = new ReplaySubject<string>();
    const formElement = this.hppCTPUserPromptFactory.createOTPForm(result, validationResponse, resendSubject);

    this.callUpdateViewCallback(false);
    this.hppCTPUserPromptService.show(formElement, this.getTargetElement());

    return result.asObservable();
  }

  private callUpdateViewCallback(displayCardForm: boolean) {
    this.onUpdateViewCallback?.call(null, { displayCardForm } as IUpdateView);
  }

  private getUnrecognizedEmailErrorMessage(): string {
    return this.translator.translate('The email address you have entered is not registered for Click to Pay.');
  }

  private getInvalidOTPCodeMessage(): string {
    return this.translator.translate('The code you have entered is incorrect.');
  }

  private getTargetElement(): HTMLElement {
    return document.getElementById(this.initParams.signInContainerId);
  }
}
