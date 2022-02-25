import { anything, instance, mock, verify, when } from 'ts-mockito';
import { of, ReplaySubject } from 'rxjs';
import { ITranslator } from '../../../../application/core/shared/translator/ITranslator';
import { SrcAggregate } from '../../digital-terminal/SrcAggregate';
import { IIdentityLookupResult } from '../../digital-terminal/interfaces/IIdentityLookupResult';
import { SrcName } from '../../digital-terminal/SrcName';
import { IMessageBus } from '../../../../application/core/shared/message-bus/IMessageBus';
import { ICompleteIdValidationResponse, IInitiateIdentityValidationResponse } from '../../digital-terminal/ISrc';
import { SimpleMessageBus } from '../../../../application/core/shared/message-bus/SimpleMessageBus';
import { HPPUserIdentificationService } from './HPPUserIdentificationService';
import { HPPCTPUserPromptFactory } from './HPPCTPUserPromptFactory';
import { HPPCTPUserPromptService } from './HPPCTPUserPromptService';

describe('HPPUserIdentificationService', () => {
  let sut: HPPUserIdentificationService;
  let modalServiceMock: HPPCTPUserPromptService;
  let modalFactoryMock: HPPCTPUserPromptFactory;
  let srcAggregateMock: SrcAggregate;
  let messageBus: IMessageBus;
  let emailResultMock;
  let codeResultMock;
  let translatorMock;

  beforeEach(() => {
    emailResultMock = new ReplaySubject();
    codeResultMock = new ReplaySubject();
    modalServiceMock = mock(HPPCTPUserPromptService);
    modalFactoryMock = mock(HPPCTPUserPromptFactory);
    translatorMock = mock<ITranslator>();
    messageBus = new SimpleMessageBus();
    srcAggregateMock = {
      identityLookup: jest.fn().mockReturnValue(of({
        consumerPresent: true,
        srcNames: [SrcName.VISA],
      } as IIdentityLookupResult)),
      initiateIdentityValidation: jest.fn().mockReturnValue(of({
        maskedValidationChannel: '',
      } as IInitiateIdentityValidationResponse)),
      completeIdentityValidation: jest.fn().mockReturnValue(of({
        idToken: 'tokenValue',
      } as ICompleteIdValidationResponse)),
    } as unknown as SrcAggregate;

    when(modalFactoryMock.createEmailForm(anything())).thenCall(resultSubject => emailResultMock.subscribe(result => resultSubject.next(result)));
    when(modalFactoryMock.createOTPForm(anything(), anything(), anything())).thenCall(resultSubject => codeResultMock.subscribe(result => resultSubject.next(result)));
    when(modalServiceMock.getStateChanges()).thenReturn(of(true));
    sut = new HPPUserIdentificationService(
      instance(modalServiceMock),
      instance(modalFactoryMock),
      instance(translatorMock),
      messageBus,
    );
    sut.setInitParams({
      signInContainerId: 'containerId',
      dpaTransactionOptions: {},
      srciDpaId: 'id',
      formId: 'form',
      cardListContainerId: 'cardContainer',
      onUpdateView: () => {},
    });
  });
  describe('identifyUser()', () => {
    describe('when identification data are provided', () => {
      it('should not ask user for email', done => {
        emailResultMock.next(false);
        codeResultMock.next(true);
        sut.identifyUser(srcAggregateMock, { email: 'test@example.com' }).subscribe(() => {
          verify(modalFactoryMock.createEmailForm(anything())).never();
          done();
        });
      });
    });
    describe('when identification data are not provided', () => {
      it('should ask user for email', done => {
        emailResultMock.next(true);
        codeResultMock.next(true);
        sut.identifyUser(srcAggregateMock).subscribe(() => {
          verify(modalFactoryMock.createEmailForm(anything())).once();
          done();
        });
      });

    });

    it('should call identity lookup method from SrcAggregate service', done => {
      codeResultMock.next(true);
      sut.identifyUser(srcAggregateMock, { email: 'test@example.com' }).subscribe(() => {
        expect(srcAggregateMock.identityLookup).toHaveBeenCalledWith({
          type: 'EMAIL',
          identityValue: 'test@example.com',
        });
        done();
      });
    });

    it('if email lookup is successful it should initialize idendity validation', (done) => {
      codeResultMock.next(true);
      sut.identifyUser(srcAggregateMock, { email: 'test@example.com' }).subscribe(result => {
        expect(srcAggregateMock.initiateIdentityValidation).toHaveBeenCalledWith(SrcName.VISA);
        done();
      });
    });

    describe('when identity validation is successful and user provides one time password code', () => {
      it('should complete identity validation', (done) => {
        const otpCode = '1234';
        codeResultMock.next(otpCode);
        sut.identifyUser(srcAggregateMock, { email: 'test@example.com' }).subscribe(result => {
          expect(srcAggregateMock.completeIdentityValidation).toHaveBeenCalledWith(SrcName.VISA, otpCode);
          done();
        });
      });

      it('if provided OTP code is valid it should return ICompleteIdValidationResponse', done => {
        const otpCode = '1234';
        codeResultMock.next(otpCode);
        const testResponse: ICompleteIdValidationResponse = { idToken: 'test token ' };
        srcAggregateMock.completeIdentityValidation = jest.fn().mockReturnValueOnce(of(testResponse));
        sut.identifyUser(srcAggregateMock, { email: 'test@example.com' })
          .subscribe(result => {
            expect(result).toEqual(testResponse);
            done();

          });
      });

      it('should close modals', (done) => {
        const otpCode = '1234';
        codeResultMock.next(otpCode);
        sut.identifyUser(srcAggregateMock, { email: 'test@example.com' })
          .subscribe(() => {
            verify(modalServiceMock.hide()).once();
            done();
          });
      });
    });
  });
})
;
