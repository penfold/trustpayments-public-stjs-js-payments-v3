import { anything, instance, mock, verify, when } from 'ts-mockito';
import { of, ReplaySubject } from 'rxjs';
import { ModalService } from '../../visa-click-to-pay/client/services/ModalService';
import { ModalFactory } from '../../visa-click-to-pay/client/services/ModalFactory';
import { UserIdentificationService } from './UserIdentificationService';
import { SrcAggregate } from './SrcAggregate';
import { IIdentityLookupResult } from './interfaces/IIdentityLookupResult';
import { SrcName } from './SrcName';
import { ICompleteIdValidationResponse, IInitiateIdentityValidationResponse } from './ISrc';

describe('UserIdentificationService', () => {
  let sut: UserIdentificationService;
  let modalServiceMock: ModalService;
  let modalFactoryMock: ModalFactory;
  let srcAggregateMock: SrcAggregate;
  let emailResultMock;
  let codeResultMock;
  beforeEach(() => {
    emailResultMock = new ReplaySubject();
    codeResultMock = new ReplaySubject();
    modalServiceMock = mock(ModalService);
    modalFactoryMock = mock(ModalFactory);
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
    sut = new UserIdentificationService(instance(modalServiceMock), instance(modalFactoryMock));
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
            verify(modalServiceMock.hide()).twice();
            done();
          });
      });
    });
  });
})
;
