import { instance, mock } from 'ts-mockito';
import { of } from 'rxjs';
import Container from 'typedi';
import { Input } from '../../core/shared/input/Input';
import { Validation } from '../../core/shared/validation/Validation';
import { MessageBusToken, TranslatorToken } from '../../../shared/dependency-injection/InjectionTokens';
import { ConfigProvider } from '../../../shared/services/config-provider/ConfigProvider';
import { SimpleMessageBus } from '../../core/shared/message-bus/SimpleMessageBus';
import { FormState } from '../../core/models/constants/FormState';
import { TestConfigProvider } from '../../../testing/mocks/TestConfigProvider';
import { Translator } from '../../core/shared/translator/Translator';
import { ITranslationProvider } from '../../core/shared/translator/ITranslationProvider';
import { TranslationProvider } from '../../core/shared/translator/TranslationProvider';
import { Formatter } from '../../core/shared/formatter/Formatter';
import { IConfig } from '../../../shared/model/config/IConfig';
import {
  TOKENIZED_SECURITY_CODE_DISABLED_CLASS,
  TOKENIZED_SECURITY_CODE_INPUT_ID,
  TOKENIZED_SECURITY_CODE_INPUT_SELECTOR,
  TOKENIZED_SECURITY_CODE_LABEL,
  TOKENIZED_SECURITY_CODE_PATTERN,
  TOKENIZED_SECURITY_CODE_WRAPPER,
} from '../../core/models/constants/SecurityCodeTokenized';
import { PUBLIC_EVENTS } from '../../core/models/constants/EventTypes';
import {
  TokenizedCardPaymentConfigName,
} from '../../../integrations/tokenized-card/models/ITokenizedCardPaymentMethod';
import { SecurityCodeTokenized } from './SecurityCodeTokenized';

const testMessageBus = new SimpleMessageBus();

Container.set({ id: TranslatorToken, type: Translator });
Container.set({ id: ITranslationProvider, type: TranslationProvider });
Container.set({ id: MessageBusToken, value: testMessageBus });

describe('SecurityCodeTokenized', () => {
  const securityCodeInstance = securityCodeFixture();

  describe('on initialization', () => {
    it('should create an instance of class SecurityCodeTokenized and input representing the form field', () => {
      expect(securityCodeInstance).toBeInstanceOf(SecurityCodeTokenized);
      expect(securityCodeInstance).toBeInstanceOf(Input);
    });

    it('should set up the listener that will reset the input - resetInputListener()', () => {
      const securityCodeInput = document.querySelector(`#${TOKENIZED_SECURITY_CODE_INPUT_ID}`) as HTMLInputElement;

      securityCodeInput.value = '123';
      securityCodeInput.classList.add('error-field');
      securityCodeInput.nextSibling.textContent = 'test';

      testMessageBus.publish({ type: PUBLIC_EVENTS.TOKENIZED_CARD_PAYMENT_CLEAR_SECURITY_INPUT });

      expect(securityCodeInput.value).toEqual('');
      expect(securityCodeInput.classList.contains('error-field')).toBeFalsy();
      expect(securityCodeInput.nextSibling.textContent).toEqual('');
    });

    describe('sets up the listener (setDisableListener()) that', () => {
      let securityCodeInput: HTMLInputElement;

      beforeEach(() => {
        securityCodeInput = document.querySelector(`#${TOKENIZED_SECURITY_CODE_INPUT_ID}`) as HTMLInputElement;
      });

      it('should resets the input on any event different than AVAILABLE', () => {
        const state = 'test';

        testMessageBus.publish({ type: PUBLIC_EVENTS.BLOCK_FORM, data: state });

        expect(securityCodeInput.disabled).toBeTruthy();
        expect(securityCodeInput.classList.contains(TOKENIZED_SECURITY_CODE_DISABLED_CLASS)).toBeTruthy();
      });

      it('should enable the input on the AVAILABLE event', () => {
        const state: FormState = FormState.AVAILABLE;

        testMessageBus.publish({ type: PUBLIC_EVENTS.BLOCK_FORM, data: state });

        expect(securityCodeInput.disabled).toBeFalsy();
        expect(securityCodeInput.classList.contains(TOKENIZED_SECURITY_CODE_DISABLED_CLASS)).toBeFalsy();
      });
    });

    describe('runs styler (initInputStyle()) that', () => {
      it('should set selector classes', () => {
        const securityCodeSelector = document.querySelector(`#${TOKENIZED_SECURITY_CODE_INPUT_SELECTOR}`) as HTMLFormElement;

        expect(securityCodeSelector.classList.contains('st-security-code--lined-up')).toBeTruthy();
      });

      it('should set input attributes', () => {
        const securityCodeInput = document.querySelector(`#${TOKENIZED_SECURITY_CODE_INPUT_ID}`) as HTMLInputElement;

        expect(securityCodeInput.placeholder).toEqual('CVC');
        expect(securityCodeInput.pattern).toEqual(TOKENIZED_SECURITY_CODE_PATTERN);
      });

      it('should set wrapper attributes', () => {
        const securityCodeWrapper = document.querySelector(`#${TOKENIZED_SECURITY_CODE_WRAPPER}`) as HTMLDivElement;
        const wrapperStyles = window.getComputedStyle(securityCodeWrapper);

        expect(wrapperStyles.padding).toEqual('20px');
      });

      it('should set label attributes and classes', () => {
        const securityCodeLabel = document.querySelector(`#${TOKENIZED_SECURITY_CODE_LABEL}`) as HTMLLabelElement;
        const securityCodeAsterisk = document.querySelector(`#${TOKENIZED_SECURITY_CODE_LABEL} .asterisk`) as HTMLSpanElement;
        const asteriskStyles = window.getComputedStyle(securityCodeAsterisk);

        expect(asteriskStyles.color).toEqual('yellow');
        expect(securityCodeLabel.classList.contains('lined-up')).toBeTruthy();
      });
    });
  });

  describe('on getLabel method called', () => {
    it('should return the label', () => {
      expect(securityCodeInstance.getLabel()).toEqual('Security code');
    });
  });
});

function securityCodeFixture() {
  document.body.innerHTML = `
<form id="st-security-code-tokenized" class="security-code">
<label id="st-security-code-tokenized-label" for="st-security-code-tokenized-input"
class="security-code__label security-code__label--required">Security code<span class="asterisk">*</span></label>
<div class="st-security-code__wrapper" id="st-security-code-tokenized-wrapper">
<input id="st-security-code-tokenized-input" class="security-code__input" type="text" autocomplete="cc-csc"
autocorrect="off" spellcheck="false" inputmode="numeric" required="">
<div id="st-security-code-tokenized-message" class="security-code__message"></div>
</div>
</form>
`;

  const config: IConfig = {
    jwt: 'test',
    [TokenizedCardPaymentConfigName]: {
      placeholder: 'CVC',
      style: {
        'color-asterisk': 'yellow',
        'outline-input': '20',
        'isLinedUp': 'true',
      },
    },
  };

  const configProvider: ConfigProvider = mock(TestConfigProvider);
  const formatter: Formatter = mock(Formatter);
  const validation: Validation = mock(Validation);

  const configProviderMock = instance(configProvider);
  const formatterMock = instance(formatter);
  const validationMock = instance(validation);

  configProviderMock.getConfig$ = jest.fn().mockReturnValue(of(config));

  return new SecurityCodeTokenized(
    configProviderMock,
    formatterMock,
    validationMock
  );
}
