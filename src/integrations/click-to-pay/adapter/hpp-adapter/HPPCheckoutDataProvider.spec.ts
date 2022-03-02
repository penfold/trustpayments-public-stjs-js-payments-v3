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

  };
  let registerCheckbox;
  let sut: HPPCheckoutDataProvider;
  const testForm = document.createElement('form');
  testForm.id = testFormId;
  testForm.innerHTML = `
<input type="checkbox" name="${HPPFormFieldName.register}">
<input type="text" name="${HPPFormFieldName.pan}">
<input type="text" name="${HPPFormFieldName.cardExpiryMonth}">
<input type="text" name="${HPPFormFieldName.cardExpiryYear}">
<input type="text" name="${HPPFormFieldName.cardSecurityCode}">
`;

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
        sut.init(testFormId).subscribe();
        testForm.dispatchEvent(submitEvent);
        expect(submitEvent.preventDefault).toHaveBeenCalled();
      });

      it('should return an observable with checkout data captured from form', (done) => {
        const expectedCheckoutData: IInitialCheckoutData = {
          consumer: {},
          srcDigitalCardId: null,
          newCardData: {
            primaryAccountNumber: testFormFieldsValues[HPPFormFieldName.pan],
            panExpirationYear: testFormFieldsValues[HPPFormFieldName.cardExpiryYear],
            panExpirationMonth: testFormFieldsValues[HPPFormFieldName.cardExpiryMonth],
            cardSecurityCode: testFormFieldsValues[HPPFormFieldName.cardSecurityCode],
            cardholderFullName: '',
          },
        };

        sut.init(testFormId).subscribe(capturedData => {
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
        sut.init(testFormId).subscribe();
        testForm.dispatchEvent(submitEvent);
        expect(submitEvent.preventDefault).not.toHaveBeenCalled();
      });
    });
  });
});

function assignFormValues(form: HTMLFormElement, fieldsValues: Record<HPPFormFieldName, string>) {
  Object.values(HPPFormFieldName).forEach(fieldName => {
    (form.querySelector(`[name="${fieldName}"]`) as HTMLInputElement).value = fieldsValues[fieldName];
  });
}
