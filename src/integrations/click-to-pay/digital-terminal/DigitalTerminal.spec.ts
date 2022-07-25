import { anyString, anything, deepEqual, instance, mock, objectContaining, verify, when } from 'ts-mockito';
import { of, switchMap } from 'rxjs';
import faker from '@faker-js/faker';
import { DigitalTerminal } from './DigitalTerminal';
import { SrcAggregate } from './SrcAggregate';
import { CheckoutDataTransformer } from './CheckoutDataTransformer';
import { SrcName } from './SrcName';
import { IAggregatedProfiles } from './interfaces/IAggregatedProfiles';
import { IInitialCheckoutData } from './interfaces/IInitialCheckoutData';
import { DcfActionCode, ICheckoutData, ICheckoutResponse } from './ISrc';
import { IUserIdentificationService } from './interfaces/IUserIdentificationService';
import { LocaleProvider } from './LocaleProvider';

describe('DigitalTerminal', () => {
  let srcAggregateMock: SrcAggregate;
  let checkoutDataTransformerMock: CheckoutDataTransformer;
  let userIdentificationServiceMock: IUserIdentificationService;
  let digitalTerminal: DigitalTerminal;
  let localeProvider: LocaleProvider;

  beforeEach(() => {
    srcAggregateMock = mock(SrcAggregate);
    checkoutDataTransformerMock = mock(CheckoutDataTransformer);
    userIdentificationServiceMock = mock<IUserIdentificationService>();
    localeProvider = mock(LocaleProvider);
    digitalTerminal = new DigitalTerminal(
      instance(srcAggregateMock),
      instance(checkoutDataTransformerMock),
      instance(localeProvider)
    );

    when(srcAggregateMock.init(anything())).thenReturn(of(undefined));
    when(localeProvider.getUserLocaleFromJwt()).thenReturn('fr_FR');
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
            dpaTransactionOptions: {
              ...dpaTransactionOptions,
              dpaLocale: 'fr_FR',
            },
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

    it('returns successful result if identification result contains idToken field', done => {
      when(userIdentificationServiceMock.identifyUser(anything(), identificationData)).thenReturn(of({ idToken: 'idtoken' }));

      digitalTerminal.identifyUser(instance(userIdentificationServiceMock), identificationData).subscribe(result => {
        expect(result.isSuccessful).toBe(true);
        done();
      });
    });

    it('returns non-successful result if identification result doesnt contain idToken field', done => {
      when(userIdentificationServiceMock.identifyUser(anything(), identificationData)).thenReturn(of({} as any));

      digitalTerminal.identifyUser(instance(userIdentificationServiceMock), identificationData).subscribe(result => {
        expect(result.isSuccessful).toBe(false);
        done();
      });
    });
  });

  describe('checkout()', () => {
    const idTokens = [faker.datatype.uuid(), faker.datatype.uuid()];
    const profiles: IAggregatedProfiles = {
      aggregatedCards: [],
      srcProfiles: {
        [SrcName.VISA]: {
          srcCorrelationId: '',
          profiles: [],
        },
      },
    };
    const initialCheckoutData: IInitialCheckoutData = {
      srcDigitalCardId: 'foobar',
    };
    const transformedCheckoutData: ICheckoutData = {
      srcCorrelationId: 'correlationid',
      dpaTransactionOptions: {
        dpaLocale: 'en_GB',
      },
    };
    const checkoutResponse: ICheckoutResponse = {
      checkoutResponse: 'checkoutResponse',
      dcfActionCode: DcfActionCode.complete,
      idToken: faker.datatype.uuid(),
      unbindAppInstance: false,
    };

    beforeEach(() => {
      when(srcAggregateMock.isRecognized()).thenReturn(of({ recognized: true, idTokens }));
      when(srcAggregateMock.getSrcProfile(deepEqual(idTokens))).thenReturn(of(profiles));
      when(checkoutDataTransformerMock.transform(initialCheckoutData, anyString(), profiles)).thenReturn(of({
        srcName: SrcName.VISA,
        checkoutData: transformedCheckoutData,
      }));
      when(srcAggregateMock.checkout(anything(), anything())).thenReturn(of(checkoutResponse));

      digitalTerminal.init({ srciDpaId: '', dpaTransactionOptions: {} }).pipe(
        switchMap(() => digitalTerminal.isRecognized()),
        switchMap(() => digitalTerminal.getSrcProfiles())
      ).subscribe();
    });

    it('runs checkout process on proper SRC using transformed checkout data', done => {
      digitalTerminal.checkout(initialCheckoutData).subscribe(result => {
        verify(srcAggregateMock.checkout(SrcName.VISA, objectContaining(transformedCheckoutData))).once();
        expect(result).toBe(checkoutResponse);
        done();
      });
    });

    describe.each([DcfActionCode.addCard, DcfActionCode.changeCard, DcfActionCode.cancel])('for certain conditions', (dcfActionCode: DcfActionCode) => {
      it('should replace idTokens with array consisting of idToken returned in checkout response', done => {
          when(srcAggregateMock.checkout(anything(), anything())).thenReturn(of({ ...checkoutResponse, dcfActionCode }));
          digitalTerminal.checkout(initialCheckoutData).subscribe(result => {
            expect(digitalTerminal['idTokens']).toEqual([result.idToken]);
            done();
          });
        }
      );
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
