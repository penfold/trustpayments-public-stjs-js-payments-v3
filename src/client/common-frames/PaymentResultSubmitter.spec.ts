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
      submitFields: ['foo', 'bar', 'baz']
    });

    form = DomMethods.createHtmlElement({ id: 'st-form' }, 'form') as HTMLFormElement;
    form.submit = jest.fn();

    document.body.appendChild(form);
  });

  describe('submit', () => {
    it('removes all previously added fields', () => {
      spyOn(DomMethods, 'removeAllCreatedFields');
      paymentResultSubmitter.submit({ foo: 'bar' });
      expect(DomMethods.removeAllCreatedFields).toHaveBeenCalledWith(form);
    });

    it('appends fields to form based on submitFields config param and some required fields', () => {
      spyOn(DomMethods, 'addDataToForm');

      paymentResultSubmitter.submit({
        foo: 'foo',
        bar: 'bar',
        xyz: 'xyz',
        jwt: 'jwt',
        threedresponse: 'threedresponse'
      });

      expect(DomMethods.addDataToForm).toHaveBeenCalledWith(form, {
        foo: 'foo',
        bar: 'bar',
        jwt: 'jwt',
        threedresponse: 'threedresponse'
      });
    });

    it('submits the form', () => {
      paymentResultSubmitter.submit({ foo: 'bar' });
      expect(form.submit).toHaveBeenCalled();
    });
  });

  afterEach(() => {
    document.body.removeChild(form);
  });
});
