import { anything, instance, mock, verify, when } from 'ts-mockito';
import { BehaviorSubject, of, ReplaySubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ITranslator } from '../../../../application/core/shared/translator/ITranslator';
import { SrcAggregate } from '../../digital-terminal/SrcAggregate';
import { IIdentityLookupResult } from '../../digital-terminal/interfaces/IIdentityLookupResult';
import { SrcName } from '../../digital-terminal/SrcName';
import { IMessageBus } from '../../../../application/core/shared/message-bus/IMessageBus';
import { ICompleteIdValidationResponse, IInitiateIdentityValidationResponse } from '../../digital-terminal/ISrc';
import { SimpleMessageBus } from '../../../../application/core/shared/message-bus/SimpleMessageBus';
import { IUpdateView } from '../interfaces/IUpdateView';
import { HPPUserIdentificationService } from './HPPUserIdentificationService';
import { HPPCTPUserPromptFactory } from './HPPCTPUserPromptFactory';
import { HPPCTPUserPromptService } from './HPPCTPUserPromptService';

describe('HPPUserIdentificationService', () => {
  const testInitParams = {
    signInContainerId: 'containerId',
    dpaTransactionOptions: {},
    srciDpaId: 'id',
    formId: 'form',
    cardListContainerId: 'cardContainer',
    onUpdateView: jest.fn(),
  };
  const promptClosedMock = new BehaviorSubject(false);
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
    when(modalServiceMock.getStateChanges()).thenReturn(promptClosedMock.asObservable());
    sut = new HPPUserIdentificationService(
      instance(modalServiceMock),
      instance(modalFactoryMock),
      instance(translatorMock),
      messageBus
    );
    sut.setInitParams(testInitParams);
  });

  it('should callUpdateView callback when user prompts are closed', done => {
    jest.clearAllMocks();
    promptClosedMock
      .pipe(filter(value => value === false))
      .subscribe((promptOpened: boolean) => {
        expect(testInitParams.onUpdateView).toHaveBeenCalledWith({ displayCardForm: true, displaySubmitForm: true } as IUpdateView);
        done();
      });
    promptClosedMock.next(false);
  });

  describe('identifyUser()', () => {
    it('should call onUpdateView callback function from config, when user prompt is shown', done => {
      emailResultMock.next(false);
      codeResultMock.next(true);
      sut.identifyUser(srcAggregateMock, { email: 'test@example.com' }).subscribe(() => {
        expect(testInitParams.onUpdateView).toHaveBeenCalledWith({
          displayCardForm: false,
          displaySubmitForm: false,
        } as IUpdateView);
        done();
      });
    });

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

    it('if email lookup is successful it should initialize identity validation', (done) => {
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

  describe('setInitParams()', () => {
    it('should save provided params in private field', () => {
      sut['initParams'] = null;
      sut.setInitParams(testInitParams);
      expect(sut['initParams']).toEqual(testInitParams);
    });
    it('should save provided onViewUpdateCallback in private field', () => {
      sut['onUpdateViewCallback'] = null;
      sut.setInitParams(testInitParams);
      expect(sut['onUpdateViewCallback']).toEqual(testInitParams.onUpdateView);
    });
  });
});
