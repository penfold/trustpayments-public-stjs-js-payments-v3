import { IInitialCheckoutData } from '../../digital-terminal/interfaces/IInitialCheckoutData';
import { HPPFormFieldName } from './HPPFormFieldName';
import { HPPCheckoutDataProvider } from './HPPCheckoutDataProvider';

describe('HPPCheckoutDataProvider()', () => {
  const testFormId = 'ctp-form';
  const testFormFieldsValues: Record<HPPFormFieldName, string> = {
    [HPPFormFieldName.cardExpiryMonth]: '12',
    [HPPFormFieldName.cardExpiryYear]: '2034',
    [HPPFormFieldName.pan]: '41111111111111111',
    [HPPFormFieldName.cardSecurityCode]: '123',
    [HPPFormFieldName.register]: null,
    [HPPFormFieldName.billingCountryIso2a]: 'GB',
    [HPPFormFieldName.billingCounty]: '',
    [HPPFormFieldName.billingEmail]: 'email@example.com',
    [HPPFormFieldName.billingFirstName]: 'Sherlock',
    [HPPFormFieldName.billingLastName]: 'Holmes',
    [HPPFormFieldName.billingPostCode]: 'NW1/W1',
    [HPPFormFieldName.billingPrefixName]: 'Mr',
    [HPPFormFieldName.billingPremise]: '221B',
    [HPPFormFieldName.billingStreet]: 'Baker Street',
    [HPPFormFieldName.billingTelephone]: '123456789',
    [HPPFormFieldName.billingTelephoneType]: '',
    [HPPFormFieldName.billingTown]: 'London',
    [HPPFormFieldName.srcCardId]: null,

  };
  let registerCheckbox;
  let sut: HPPCheckoutDataProvider;
  const testForm = generateTestFormHTML(testFormId);

  beforeAll(() => {
    document.body.appendChild(testForm);
    registerCheckbox = document.querySelector(`[name="${HPPFormFieldName.register}"]`);
    assignFormValues(testForm, testFormFieldsValues);
    sut = new HPPCheckoutDataProvider();
  });

  describe('init()', () => {
    let submitEvent;
    beforeEach(() => {
      submitEvent = new Event('submit');
      submitEvent.preventDefault = jest.fn();
    });

    describe('when card registration is enabled in form', () => {
      beforeEach(() => {
        registerCheckbox.checked = true;
      });

      it('should capture and stop submit event', () => {
        sut.getCheckoutData(testFormId).subscribe();
        testForm.dispatchEvent(submitEvent);
        expect(submitEvent.preventDefault).toHaveBeenCalled();
      });

      it('should return an observable with checkout data captured from form', (done) => {
        // TODO add test cases with some billing form  fields being empty
        const expectedCheckoutData: IInitialCheckoutData = {
          consumer: {
            fullName: `${testFormFieldsValues[HPPFormFieldName.billingFirstName]} ${testFormFieldsValues[HPPFormFieldName.billingLastName]}`,
            lastName: testFormFieldsValues[HPPFormFieldName.billingLastName],
            firstName: testFormFieldsValues[HPPFormFieldName.billingFirstName],
            countryCode: testFormFieldsValues[HPPFormFieldName.billingCountryIso2a],
            consumerIdentity: {
              type: 'EMAIL',
              identityValue: testFormFieldsValues[HPPFormFieldName.billingEmail],
            },
            emailAddress: testFormFieldsValues[HPPFormFieldName.billingEmail],
          },
          srcDigitalCardId: '',
          newCardData: {
            primaryAccountNumber: testFormFieldsValues[HPPFormFieldName.pan],
            panExpirationYear: testFormFieldsValues[HPPFormFieldName.cardExpiryYear],
            panExpirationMonth: testFormFieldsValues[HPPFormFieldName.cardExpiryMonth],
            cardSecurityCode: testFormFieldsValues[HPPFormFieldName.cardSecurityCode],
            cardholderFullName: `${testFormFieldsValues[HPPFormFieldName.billingFirstName]} ${testFormFieldsValues[HPPFormFieldName.billingLastName]}`,
          },
        };

        sut.getCheckoutData(testFormId).subscribe(capturedData => {
          expect(capturedData).toEqual(expectedCheckoutData);
          done();
        });
        testForm.dispatchEvent(submitEvent);
      });
    });

    describe('when card registration is not enabled in form', () => {
      beforeEach(() => {
        registerCheckbox.checked = false;
      });

      it('should capture and stop submit event', () => {
        sut.getCheckoutData(testFormId).subscribe();
        testForm.dispatchEvent(submitEvent);
        expect(submitEvent.preventDefault).not.toHaveBeenCalled();
      });
    });
  });
});

function assignFormValues(form: HTMLFormElement, fieldsValues: Partial<Record<HPPFormFieldName, string>>) {
  Object.values(HPPFormFieldName).forEach(fieldName => {
    (form.querySelector(`[name="${fieldName}"]`) as HTMLInputElement).value = fieldsValues[fieldName];
  });
}

function generateTestFormHTML(testFormId: string): HTMLFormElement {
  const testForm = document.createElement('form');
  testForm.id = testFormId;
  testForm.innerHTML = `
<input type="checkbox" name="${HPPFormFieldName.register}">
${Object.values(HPPFormFieldName).filter(key => key !== HPPFormFieldName.register).map(fieldName => `<input type="text" name="${fieldName}">`).join('\n')}
`;

  return testForm;
}

