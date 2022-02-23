import { BehaviorSubject, combineLatest, NEVER, Observable, of, ReplaySubject } from 'rxjs';
import { Service } from 'typedi';
import { catchError, filter, map, switchMap, tap } from 'rxjs/operators';
import { ModalService } from '../../visa-click-to-pay/client/services/ModalService';
import { ModalFactory } from '../../visa-click-to-pay/client/services/ModalFactory';
import { SrcAggregate } from './SrcAggregate';
import { ICompleteIdValidationResponse, IInitiateIdentityValidationResponse } from './ISrc';
import { IIdentificationData } from './interfaces/IIdentificationData';
import { SrcName } from './SrcName';

@Service()
export class UserIdentificationService {
  constructor(private modalService: ModalService, private modalFactory: ModalFactory) {
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
              this.modalService.clearNotifications();
              this.modalService.showNotification('Email not recognized');
            } else {
              this.modalService.clearNotifications();
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
                  catchError(error => this.handleInvalidOTPCode(error))
                )
              ),
              tap(() => this.modalService.hide())
            )
        )
      );
  }

  private handleInvalidOTPCode(error) {
    this.modalService.clearNotifications();
    this.modalService.showNotification('Code is invalid');
    return NEVER;
  }

  private askForEmail(): Observable<string> {
    const result = new ReplaySubject<string>();
    const formElement = this.modalFactory.createEmailForm(result);
    this.modalService.hide();
    this.modalService.show(formElement);

    return result.asObservable();
  }

  private askForCode(validationResponse: IInitiateIdentityValidationResponse, resendSubject: BehaviorSubject<boolean>): Observable<any> {
    const result = new ReplaySubject<string>();
    const formElement = this.modalFactory.createOTPForm(result, validationResponse, resendSubject);
    this.modalService.hide();
    this.modalService.show(formElement);

    return result.asObservable();
  }
}
