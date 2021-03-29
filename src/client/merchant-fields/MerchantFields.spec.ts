import { MerchantFields } from './MerchantFields';
import Container from 'typedi';
import { TranslatorToken } from '../../shared/dependency-injection/InjectionTokens';
import { Translator } from '../../application/core/shared/translator/Translator';
import { ITranslationProvider } from '../../application/core/shared/translator/ITranslationProvider';
import { TranslationProvider } from '../../application/core/shared/translator/TranslationProvider';
import { ConfigProvider } from '../../shared/services/config-provider/ConfigProvider';
import { TestConfigProvider } from '../../testing/mocks/TestConfigProvider';

jest.mock('./../../application/core/shared/notification/Notification');

Container.set({ id: ConfigProvider, type: TestConfigProvider });
Container.set({ id: TranslatorToken, type: Translator });
Container.set({ id: ITranslationProvider, type: TranslationProvider });

describe('MerchantField', () => {
  describe('init()', () => {
    const { instance } = merchantFieldsFixture();

    beforeEach(() => {
      // @ts-ignore
      instance._onKeyPress = jest.fn();
      instance.init();
    });

    it('should call _onKeyPress', () => {
      // @ts-ignore
      expect(instance._onKeyPress).toHaveBeenCalled();
    });

    it('should return collection of merchant inputs', () => {
      const firstName = document.getElementById('example-form-name');
      const email = document.getElementById('example-form-email');
      // @ts-ignore
      expect(instance._getMerchantInputs()).toEqual({
        inputs: [firstName, email]
      });
    });
  });
});

function merchantFieldsFixture() {
  document.body.innerHTML =
    '<div class="example-form__section example-form__section--horizontal"><div class="example-form__group"><label for="example-form-name" class="example-form__label">NAME</label><input id="example-form-name" class="example-form__input" type="text" placeholder="John Doe" autocomplete="name" name="myBillName" data-st-name="billingfirstname"></div> <div class="example-form__group"> <label for="example-form-email" class="example-form__label">E-MAIL</label> <input id="example-form-email" class="example-form__input" type="email" placeholder="test@mail.com" autocomplete="email" name="myBillEmail" data-st-name="billingemail"> </div> <div class="example-form__group"> <label for="example-form-phone" class="example-form__label">PHONE</label> <input id="example-form-phone" class="example-form__input" type="tel" placeholder="+00 000 000 000" autocomplete="tel" name="myBillTel"></div></div>';
  const instance = new MerchantFields();
  const receivedMerchantFieldsArray = { merchantFieldsNamesArray: ['billingfirstname', 'billingemail'] };
  return { instance, receivedMerchantFieldsArray };
}
