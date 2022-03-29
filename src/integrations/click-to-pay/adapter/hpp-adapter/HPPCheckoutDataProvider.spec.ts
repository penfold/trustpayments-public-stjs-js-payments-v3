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
    [HPPFormFieldName.billingCounty]: 'WL',
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
          cardholderFirstName: testFormFieldsValues[HPPFormFieldName.billingFirstName],
          cardholderLastName: testFormFieldsValues[HPPFormFieldName.billingLastName],
          billingAddress: {
            city: testFormFieldsValues[HPPFormFieldName.billingTown],
            countryCode: testFormFieldsValues[HPPFormFieldName.billingCountryIso2a],
            line1: testFormFieldsValues[HPPFormFieldName.billingPremise],
            line2: testFormFieldsValues[HPPFormFieldName.billingStreet],
            state: testFormFieldsValues[HPPFormFieldName.billingCounty],
            zip: testFormFieldsValues[HPPFormFieldName.billingPostCode],
          },
        },
      };
      beforeEach(() => {
        registerCheckbox.checked = true;
      });

      it('should capture and stop submit event', () => {
        sut.getCheckoutData(testFormId).subscribe();
        testForm.dispatchEvent(submitEvent);
        expect(submitEvent.preventDefault).toHaveBeenCalled();
      });

      it('should prevent onsubmit form callback from being called', ()=> {
        const submitCallback = jest.fn();
        testForm.onsubmit = submitCallback;
        sut.getCheckoutData(testFormId).subscribe();
        testForm.dispatchEvent(submitEvent);
        testForm.submit();
        expect(submitCallback).not.toHaveBeenCalled();
      });

      it('should prevent onclick submit input callback from being called', ()=> {
        const clickCallback = jest.fn();
        const submitInput = testForm.querySelector('input[type="submit"]') as HTMLElement;
        submitInput.onclick = clickCallback;
        sut.getCheckoutData(testFormId).subscribe();
        submitInput.dispatchEvent(new Event('click'));
        expect(clickCallback).not.toHaveBeenCalled();
      });

      it('should return an observable with checkout data captured from form', (done) => {
        // TODO add test cases with some billing form  fields being empty
        sut.getCheckoutData(testFormId).subscribe(capturedData => {
          expect(capturedData).toEqual(expectedCheckoutData);
          done();
        });
        testForm.dispatchEvent(submitEvent);
      });

      describe.each([
        '4000 0000 0000 0001',
        ' 4000 0000 000000 01 ',
        '   4 0 0 0 0 0 0 0 0   0 0 0 0 0 0 1',
      ])('when pan input contains spaces', testValue => {
        it('should remove spaces', done => {
          const panInput = testForm.querySelector(`[name="${HPPFormFieldName.pan}"]`);
          (panInput as HTMLInputElement).value = testValue;
          sut.getCheckoutData(testFormId).subscribe(capturedData => {
            expect(capturedData.newCardData.primaryAccountNumber).toEqual('4000000000000001');
            done();
          });
          testForm.dispatchEvent(submitEvent);
        });
      });
    });

    it('should remove empty fields from billingAddress object', done => {
      assignFormValues(testForm, {
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
      assignFormValues(testForm, {
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

    describe('when card registration is not enabled in form and card list for recognized user is not displayed', () => {
      beforeEach(() => {
        registerCheckbox.checked = false;
      });

      it('should not capture submit event', () => {
        sut.getCheckoutData(testFormId).subscribe();
        testForm.dispatchEvent(submitEvent);
        expect(submitEvent.preventDefault).not.toHaveBeenCalled();
      });

      it('should not prevent onsubmit form callback from being called', ()=> {
        const submitCallback = jest.fn();
        testForm.onsubmit = submitCallback;
        sut.getCheckoutData(testFormId).subscribe();
        testForm.submit();
        expect(submitCallback).toHaveBeenCalled();
      });

      it('should not prevent onclick submit input callback from being called', ()=> {
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
  testForm.innerHTML += '<input type="submit" value="Submit form">';

  return testForm;
}

