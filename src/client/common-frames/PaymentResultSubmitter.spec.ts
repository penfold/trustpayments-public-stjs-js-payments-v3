import { ConfigProvider } from '../../shared/services/config-provider/ConfigProvider';
import { PaymentResultSubmitter } from './PaymentResultSubmitter';
import { instance, mock, when } from 'ts-mockito';
import { DomMethods } from '../../application/core/shared/dom-methods/DomMethods';

describe('PaymentResultSubmitter', () => {
  let configProviderMock: ConfigProvider;
  let paymentResultSubmitter: PaymentResultSubmitter;
  let form: HTMLFormElement;

  beforeEach(() => {
    configProviderMock = mock<ConfigProvider>();
    paymentResultSubmitter = new PaymentResultSubmitter(instance(configProviderMock));

    when(configProviderMock.getConfig()).thenReturn({
      formId: 'st-form',
      submitFields: ['foo', 'bar', 'baz'],
    });

    form = DomMethods.createHtmlElement({ id: 'st-form' }, 'form') as HTMLFormElement;
    form.submit = jest.fn();

    document.body.appendChild(form);
  });

  describe('submitForm()', () => {
    it('removes all previously added fields', () => {
      jest.spyOn(DomMethods, 'removeAllCreatedFields');
      paymentResultSubmitter.submitForm({ foo: 'bar' });
      expect(DomMethods.removeAllCreatedFields).toHaveBeenCalledWith(form);
    });

    it('appends fields to form based on submitFields config param and some required fields', () => {
      jest.spyOn(DomMethods, 'addDataToForm');

      paymentResultSubmitter.submitForm({
        foo: 'foo',
        bar: 'bar',
        xyz: 'xyz',
        jwt: 'jwt',
        threedresponse: 'threedresponse',
      });

      expect(DomMethods.addDataToForm).toHaveBeenCalledWith(form, {
        foo: 'foo',
        bar: 'bar',
        jwt: 'jwt',
        threedresponse: 'threedresponse',
      });
    });

    it('submits the form', () => {
      paymentResultSubmitter.submitForm({ foo: 'bar' });
      expect(form.submit).toHaveBeenCalled();
    });
  });

  describe('prepareForm()', () => {
    it('returns the form element', () => {
      expect(paymentResultSubmitter.prepareForm({ foo: 'bar' })).toBe(form);
    });

    it('removes all previously added fields', () => {
      jest.spyOn(DomMethods, 'removeAllCreatedFields');
      paymentResultSubmitter.prepareForm({ foo: 'bar' });
      expect(DomMethods.removeAllCreatedFields).toHaveBeenCalledWith(form);
    });

    it('appends fields to form based on submitFields config param and some required fields', () => {
      jest.spyOn(DomMethods, 'addDataToForm');

      paymentResultSubmitter.prepareForm({
        foo: 'foo',
        bar: 'bar',
        xyz: 'xyz',
        jwt: 'jwt',
        threedresponse: 'threedresponse',
      });

      expect(DomMethods.addDataToForm).toHaveBeenCalledWith(form, {
        foo: 'foo',
        bar: 'bar',
        jwt: 'jwt',
        threedresponse: 'threedresponse',
      });
    });
  });

  afterEach(() => {
    document.body.removeChild(form);
  });
});
