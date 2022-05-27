import { HPPFormValues } from '../interfaces/HPPFormValues';
import { NewCardFieldName } from '../../card-list/NewCardFieldName';
import { HPPFormValuesProvider } from './HPPFormValuesProvider';
import { HPPFormFieldName } from './HPPFormFieldName';

describe('HPPFormValuesProvider()', () => {
  const testFormFieldsValues: HPPFormValues = {
    [HPPFormFieldName.cardExpiryMonth]: '12',
    [HPPFormFieldName.cardExpiryYear]: '2034',
    [HPPFormFieldName.pan]: '41111111111111111',
    [HPPFormFieldName.cardSecurityCode]: '123',
    [HPPFormFieldName.register]: 'on',
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
    [HPPFormFieldName.srcCardId]: '234',
    [NewCardFieldName.pan]: '400000',
    [NewCardFieldName.expiryMonth]: '12',
    [NewCardFieldName.expiryYear]: '2020',
    [NewCardFieldName.securityCode]: '1234',
  };
  let sut: HPPFormValuesProvider;
  let testFormElement;

  beforeEach(() => {
    sut = new HPPFormValuesProvider();
    testFormElement = generateTestFormHTML('test-form', testFormFieldsValues);
  });

  describe('getFormValues()', () => {
    it('should object with values of provided form element fields values', () => {
      expect(sut.getFormValues(testFormElement)).toEqual(testFormFieldsValues);
    });
  });

  describe('isRegisterCardEnabled()', () => {
    it('should return true if register new card checkbox is enabled in form', () => {
      testFormElement.querySelector(`[name="${HPPFormFieldName.register}"]`).checked = true;
      expect(sut.isRegisterCardEnabled(testFormElement)).toEqual(true);

      testFormElement.querySelector(`[name="${HPPFormFieldName.register}"]`).checked = false;
      expect(sut.isRegisterCardEnabled(testFormElement)).toEqual(false);

      testFormElement.querySelector(`[name="${HPPFormFieldName.register}"]`).remove();
      expect(sut.isRegisterCardEnabled(testFormElement)).toEqual(false);
    });
  });

  describe('isCardListVisible()', () => {
    it('should return true if card list is visible in form element', () => {
      expect(sut.isCardListVisible(testFormElement)).toEqual(true);

      Object.values(NewCardFieldName).forEach(fieldName => testFormElement.elements.namedItem(fieldName).remove());
      expect(sut.isCardListVisible(testFormElement)).toEqual(false);
    });
  });
});

function generateTestFormHTML(testFormId: string, values: HPPFormValues): HTMLFormElement {
  const testForm = document.createElement('form');
  testForm.id = testFormId;
  testForm.innerHTML = `<input type="checkbox" name="${HPPFormFieldName.register}">
${Object.keys(values).map(fieldName => `<input type="text" name="${fieldName}" value="${values[fieldName]}">`).join('\n')}
`;

  return testForm;
}
