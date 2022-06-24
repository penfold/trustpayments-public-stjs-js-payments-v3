import { anything, instance, mock, when } from 'ts-mockito';
import { of } from 'rxjs';
import { IInitialCheckoutData } from '../../digital-terminal/interfaces/IInitialCheckoutData';
import { JwtProvider } from '../../../../shared/services/jwt-provider/JwtProvider';
import { IStJwtPayload } from '../../../../application/core/models/IStJwtPayload';
import { HPPFormValues } from '../interfaces/HPPFormValues';
import { PhoneNumberParser } from '../../../../shared/services/phone-number-parser/PhoneNumberParser';
import { HPPFormFieldName } from './HPPFormFieldName';
import { HPPCheckoutDataProvider } from './HPPCheckoutDataProvider';
import { HPPFormValuesProvider } from './HPPFormValuesProvider';
import {
  expectedCheckoutDataCardFromJWT,
  expectedCheckoutDataFromForm,
  expectedCheckoutDataFromJWT,
  expectedCheckoutDataMixed,
  mockJwtPayload,
  mockJwtPayloadOnlyCard,
  testFormFieldsValues,
  testFormFieldsValuesIncomplete,
  testFormValuesNoCard,
} from './HPPCheckoutDataProvider.mocks';
// TODO tests should be extended with more cases
describe('HPPCheckoutDataProvider()', () => {
  const testFormId = 'ctp-form';
  let jwtProviderMock: JwtProvider;
  let hppFormValuesProviderMock: HPPFormValuesProvider;
  let phoneNumberParserMock: PhoneNumberParser;
  let sut: HPPCheckoutDataProvider;
  let testForm: HTMLFormElement;
  let submitEvent;

  beforeAll(() => {
    testForm = document.createElement('form');
    testForm.id = testFormId;
    testForm.innerHTML = '<input type="submit">';
    document.body.appendChild(testForm);
  });

  beforeEach(() => {
    submitEvent = new Event('submit');
    submitEvent.preventDefault = jest.fn();
    jwtProviderMock = mock(JwtProvider);
    hppFormValuesProviderMock = mock(HPPFormValuesProvider);
    phoneNumberParserMock = mock(PhoneNumberParser);
    when(hppFormValuesProviderMock.getFormValues(anything())).thenReturn(testFormFieldsValues);
    when(jwtProviderMock.getJwtPayload()).thenReturn(of({} as IStJwtPayload));
    when(hppFormValuesProviderMock.isRegisterCardEnabled(anything())).thenReturn(true);
    when(hppFormValuesProviderMock.isCardListVisible(anything())).thenReturn(false);
    when(phoneNumberParserMock.decodePhoneNumber(mockJwtPayload.billingtelephone)).thenReturn({
      phoneNumber: '500100100',
      countryCode: '48',
    });
    sut = new HPPCheckoutDataProvider(instance(jwtProviderMock), instance(hppFormValuesProviderMock), instance(phoneNumberParserMock));
  });

  describe('init()', () => {
    describe('when card registration is enabled in form', () => {
      it('should capture and stop submit event', () => {
        sut.getCheckoutData(testFormId).subscribe();
        testForm.dispatchEvent(submitEvent);
        expect(submitEvent.preventDefault).toHaveBeenCalled();
      });

      describe.each([
        [{}, testFormFieldsValues, expectedCheckoutDataFromForm],
        [mockJwtPayload, testFormFieldsValues, expectedCheckoutDataFromForm],
        [mockJwtPayload, testFormFieldsValuesIncomplete, expectedCheckoutDataMixed],
        [mockJwtPayload, {}, expectedCheckoutDataFromJWT],
        [mockJwtPayloadOnlyCard, testFormValuesNoCard, expectedCheckoutDataCardFromJWT],
      ] as [IStJwtPayload, HPPFormValues, IInitialCheckoutData][])('should use JWT billing data and captured form values', (
        jwtPayload, formValues, expectedCheckoutData
      ) => {
        it('should return an observable with checkout data captured from form', done => {
          when(jwtProviderMock.getJwtPayload()).thenReturn(of(jwtPayload));
          when(hppFormValuesProviderMock.getFormValues(anything())).thenReturn(formValues);

          sut.getCheckoutData(testFormId).subscribe(capturedData => {
            expect(capturedData).toEqual(expectedCheckoutData);
            done();
          });
          testForm.dispatchEvent(submitEvent);
        });
      });

      describe.each([
        '4000 0000 0000 0001',
        ' 4000 0000 000000 01 ',
        '   4 0 0 0 0 0 0 0 0   0 0 0 0 0 0 1',
      ])('when pan input contains spaces', testValue => {
        it('should remove spaces', done => {
          when(hppFormValuesProviderMock.getFormValues(anything())).thenReturn({
            ...testFormFieldsValues,
            [HPPFormFieldName.pan]: testValue,
          });
          sut.getCheckoutData(testFormId).subscribe(capturedData => {
            expect(capturedData.newCardData.primaryAccountNumber).toEqual('4000000000000001');
            done();
          });
          testForm.dispatchEvent(submitEvent);
        });
      });
    });

    it('should remove empty fields from billingAddress object', done => {
      when(hppFormValuesProviderMock.getFormValues(anything())).thenReturn({
        ...testFormFieldsValues,
        [HPPFormFieldName.billingPremise]: '',
        [HPPFormFieldName.billingStreet]: '',
        [HPPFormFieldName.billingTown]: '',
      });

      sut.getCheckoutData(testFormId).subscribe(capturedData => {
        expect(capturedData.newCardData.billingAddress.line1).not.toBeDefined();
        expect(capturedData.newCardData.billingAddress.line2).not.toBeDefined();
        expect(capturedData.newCardData.billingAddress.city).not.toBeDefined();
        done();
      });
      testForm.dispatchEvent(submitEvent);
    });

    it('when all billingAddress object fields are empty it should be set to null', done => {
      when(hppFormValuesProviderMock.getFormValues(anything())).thenReturn({
        ...testFormFieldsValues,
        [HPPFormFieldName.billingCountryIso2a]: '',
        [HPPFormFieldName.billingCounty]: '',
        [HPPFormFieldName.billingEmail]: '',
        [HPPFormFieldName.billingFirstName]: '',
        [HPPFormFieldName.billingLastName]: '',
        [HPPFormFieldName.billingPostCode]: '',
        [HPPFormFieldName.billingPrefixName]: '',
        [HPPFormFieldName.billingPremise]: '',
        [HPPFormFieldName.billingStreet]: '',
        [HPPFormFieldName.billingTelephone]: '',
        [HPPFormFieldName.billingTelephoneType]: '',
        [HPPFormFieldName.billingTown]: '',
      });

      sut.getCheckoutData(testFormId).subscribe(capturedData => {
        expect(capturedData.newCardData.billingAddress).toBeNull();
        done();
      });
      testForm.dispatchEvent(submitEvent);
    });

    describe.each([
      {
        [HPPFormFieldName.billingFirstName]: '',
        [HPPFormFieldName.billingLastName]: '',
      },
      {
        [HPPFormFieldName.billingFirstName]: '',
        [HPPFormFieldName.billingLastName]: 'b',
      },
      {
        [HPPFormFieldName.billingFirstName]: 'a',
        [HPPFormFieldName.billingLastName]: null,
      },
      {
        [HPPFormFieldName.billingFirstName]: 'firstName',
        [HPPFormFieldName.billingLastName]: '',
      },
      {
        [HPPFormFieldName.billingFirstName]: '',
        [HPPFormFieldName.billingLastName]: 'LastName',
      },
    ])('when billing data doesn\'t contain first and last name', billingAddressTestData => {
      it('should return billingAddress with null as value', done => {
        when(hppFormValuesProviderMock.getFormValues(anything())).thenReturn({
          ...testFormFieldsValues,
          ...billingAddressTestData,
        });

        sut.getCheckoutData(testFormId).subscribe(capturedData => {
          expect(capturedData.newCardData.billingAddress).toBeNull();
          done();
        });
        testForm.dispatchEvent(submitEvent);
      });
    });

    describe('when card registration is not enabled in form and card list for recognized user is not displayed', () => {
      beforeEach(() => {
        when(hppFormValuesProviderMock.isRegisterCardEnabled(anything())).thenReturn(false);
        when(hppFormValuesProviderMock.isCardListVisible(anything())).thenReturn(false);
        jest.clearAllMocks();
      });

      // TODO Disabled temporarily
      it.skip('should not interrupt default submit event behavior', () => {
        const submitEvent2 = new Event('submit');
        submitEvent2.preventDefault = jest.fn();
        sut.getCheckoutData(testFormId).subscribe();
        testForm.dispatchEvent(submitEvent2);
        expect(submitEvent2.preventDefault).not.toHaveBeenCalled();
      });

      it('should not prevent onsubmit form callback from being called', () => {
        const submitCallback = jest.fn();
        testForm.onsubmit = submitCallback;
        sut.getCheckoutData(testFormId).subscribe();
        testForm.submit();
        expect(submitCallback).toHaveBeenCalled();
      });

      it('should not prevent onclick submit input callback from being called', () => {
        const clickCallback = jest.fn();
        const submitInput = testForm.querySelector('input[type="submit"]') as HTMLElement;
        submitInput.onclick = clickCallback;
        sut.getCheckoutData(testFormId).subscribe();
        submitInput.dispatchEvent(new Event('click'));
        expect(clickCallback).toHaveBeenCalled();
      });
    });
  });
});

