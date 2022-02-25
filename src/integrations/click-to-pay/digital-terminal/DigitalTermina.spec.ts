import { anyString, anything, deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { of, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DigitalTerminal } from './DigitalTerminal';
import { SrcAggregate } from './SrcAggregate';
import { CheckoutDataTransformer } from './CheckoutDataTransformer';
import { UserIdentificationService } from './UserIdentificationService';
import { SrcName } from './SrcName';
import { IAggregatedProfiles } from './interfaces/IAggregatedProfiles';
import { IInitialCheckoutData } from './interfaces/IInitialCheckoutData';
import { ICheckoutData, ICheckoutResponse } from './ISrc';

describe('DigitalTerminal', () => {
  let srcAggregateMock: SrcAggregate;
  let checkoutDataTransformerMock: CheckoutDataTransformer;
  let userIdentificationServiceMock: UserIdentificationService;
  let digitalTerminal: DigitalTerminal;

  beforeEach(() => {
    srcAggregateMock = mock(SrcAggregate);
    checkoutDataTransformerMock = mock(CheckoutDataTransformer);
    userIdentificationServiceMock = mock(UserIdentificationService);
    digitalTerminal = new DigitalTerminal(
      instance(srcAggregateMock),
      instance(checkoutDataTransformerMock),
      instance(userIdentificationServiceMock),
    );

    when(srcAggregateMock.init(anything())).thenReturn(of(undefined));
  });

  describe('init()', () => {
    it('initiates the src aggregate using passed config', done => {
      const dpaTransactionOptions = { merchantOrderId: '12345' };
      const srciDpaId = 'foobar';

      digitalTerminal
        .init({ srciDpaId, dpaTransactionOptions })
        .subscribe(() => {
          verify(srcAggregateMock.init(deepEqual({
            srciDpaId,
            dpaTransactionOptions,
            srcInitiatorId: environment.CLICK_TO_PAY.VISA.SRC_INITIATOR_ID,
            srciTransactionId: anyString(),
          }))).once();
        done();
      });
    });
  });

  describe('isRecognized()', () => {
    beforeEach(() => {
      digitalTerminal.init({
        srciDpaId: 'foobar',
        dpaTransactionOptions: {},
      });
    });

    it('returns true if the user is recognized', done => {
      when(srcAggregateMock.isRecognized()).thenReturn(of({ recognized: true, idTokens: ['123'] }));

      digitalTerminal.isRecognized().subscribe(result => {
        expect(result).toBe(true);
        done();
      });
    });

    it('returns false if the user is not recognized', done => {
      when(srcAggregateMock.isRecognized()).thenReturn(of({ recognized: false, idTokens: [] }));

      digitalTerminal.isRecognized().subscribe(result => {
        expect(result).toBe(false);
        done();
      });
    });
  });

  describe('getSrcProfiles()', () => {
    const idTokens = ['foobar123'];

    beforeEach(() => {
      digitalTerminal.init({
        srciDpaId: 'foobar',
        dpaTransactionOptions: {},
      }).subscribe();

      when(srcAggregateMock.isRecognized()).thenReturn(of({ recognized: true, idTokens }));

      digitalTerminal.isRecognized().subscribe();
    });

    it('returns src profiles from aggregate', done => {
      const profiles = {
        srcProfiles: {
          [SrcName.VISA]: {
            profiles: [],
            srcCorrelationId: '',
          },
        },
        aggregatedCards: [],
      };

      when(srcAggregateMock.getSrcProfile(deepEqual(idTokens))).thenReturn(of(profiles));

      digitalTerminal.getSrcProfiles().subscribe(result => {
        expect(result).toBe(profiles);
        done();
      });
    });
  });

  describe('identifyUser()', () => {
    const identificationData = { email: 'user@trustpayments.net' };

    beforeEach(() => {
      digitalTerminal.init({ srciDpaId: '', dpaTransactionOptions: {} }).subscribe();
    });

    it('returns successful result if identification result contains idToken', done => {
      when(userIdentificationServiceMock.identifyUser(anything(),identificationData,)).thenReturn(of({ idToken: 'idtoken' }));

      digitalTerminal.identifyUser(identificationData).subscribe(result => {
        expect(result.isSuccessful).toBe(true);
        done();
      });
    });

    it('returns non-successful result if identification result doesnt contain idToken', done => {
      when(userIdentificationServiceMock.identifyUser(anything(),identificationData,)).thenReturn(of({ idToken: undefined }));

      digitalTerminal.identifyUser(identificationData).subscribe(result => {
        expect(result.isSuccessful).toBe(false);
        done();
      });
    });
  });

  describe('checkout()', () => {
    const idTokens = ['idtoken'];
    const profiles: IAggregatedProfiles = {
      aggregatedCards: [],
      srcProfiles: {
        [SrcName.VISA]: {
          srcCorrelationId: '',
          profiles: [],
        },
      },
    };

    beforeEach(() => {
      when(srcAggregateMock.isRecognized()).thenReturn(of({ recognized: true, idTokens }));
      when(srcAggregateMock.getSrcProfile(deepEqual(idTokens))).thenReturn(of(profiles));

      digitalTerminal.init({ srciDpaId: '', dpaTransactionOptions: {} }).pipe(
        switchMap(() => digitalTerminal.isRecognized()),
        switchMap(() => digitalTerminal.getSrcProfiles())
      ).subscribe();
    });

    it('runs checkout process on proper SRC using transformed checkout data', done => {
      const initialCheckoutData: IInitialCheckoutData = {
        srcDigitalCardId: 'foobar',
      };
      const transformedCheckoutData: ICheckoutData = {
        srcCorrelationId: 'correlationid',
      };
      const checkoutResponse: ICheckoutResponse = {
        srciTransactionId: '',
        isGuestCheckout: false,
        assuranceData: null,
        encryptedPayload: '',
        maskedCard: null,
        maskedConsumer: null,
        srcCorrelationId: '',
        isNewUser: true,
        shippingAddressZip: '',
        shippingCountryCode: '',
      };

      when(checkoutDataTransformerMock.transform(initialCheckoutData, anyString(), profiles)).thenReturn(of({
        srcName: SrcName.VISA,
        checkoutData: transformedCheckoutData,
      }));
      when(srcAggregateMock.checkout(anything(), anything())).thenReturn(of(checkoutResponse));

      digitalTerminal.checkout(initialCheckoutData).subscribe(result => {
        verify(srcAggregateMock.checkout(SrcName.VISA, transformedCheckoutData)).once();
        expect(result).toBe(checkoutResponse);
        done();
      });
    });
  });

  describe('unbindAppInstance()', () => {
    it('calls the unbind method on SRC aggregate', done => {
      when(srcAggregateMock.unbindAppInstance()).thenReturn(of(undefined));

      digitalTerminal.unbindAppInstance().subscribe(() => {
        verify(srcAggregateMock.unbindAppInstance()).once();
        done();
      });
    });
  });
});
