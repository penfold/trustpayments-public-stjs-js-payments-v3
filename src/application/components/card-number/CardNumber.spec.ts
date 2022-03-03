import { instance as mockInstance, instance, mock, when } from 'ts-mockito';
import { Container, ContainerInstance } from 'typedi';
import { of } from 'rxjs';
import { Validation } from '../../core/shared/validation/Validation';
import { PUBLIC_EVENTS } from '../../core/models/constants/EventTypes';
import { MessageBusToken, TranslatorToken } from '../../../shared/dependency-injection/InjectionTokens';
import { ConfigProvider } from '../../../shared/services/config-provider/ConfigProvider';
import { SimpleMessageBus } from '../../core/shared/message-bus/SimpleMessageBus';
import { TestConfigProvider } from '../../../testing/mocks/TestConfigProvider';
import { Translator } from '../../core/shared/translator/Translator';
import { Utils } from '../../core/shared/utils/Utils';
import { EventScope } from '../../core/models/constants/EventScope';
import { CARD_NUMBER_INPUT, CARD_NUMBER_LABEL, CARD_NUMBER_MESSAGE } from '../../core/models/constants/Selectors';
import { FormState } from '../../core/models/constants/FormState';
import { ITranslationProvider } from '../../core/shared/translator/ITranslationProvider';
import { TranslationProvider } from '../../core/shared/translator/TranslationProvider';
import { IconFactory } from '../../core/services/icon/IconFactory';
import { Formatter } from '../../core/shared/formatter/Formatter';
import { IConfig } from '../../../shared/model/config/IConfig';
import { ValidationFactory } from '../../core/shared/validation/ValidationFactory';
import { Input } from '../../core/shared/input/Input';
import { CardNumber } from './CardNumber';

const testMessageBus = new SimpleMessageBus();

Container.set({ id: ConfigProvider, type: TestConfigProvider });
Container.set({ id: TranslatorToken, type: Translator });
Container.set({ id: ITranslationProvider, type: TranslationProvider });
Container.set({ id: MessageBusToken, value: testMessageBus });

describe('CardNumber', () => {
  const { inputElement, messageElement, cardNumberInstance, labelElement, cardNumberCorrect } = cardNumberFixture();
  const cardNumberInput: HTMLInputElement = document.querySelector('#st-card-number-input');

  beforeAll(() => {
    document.body.appendChild(inputElement);
    document.body.appendChild(labelElement);
    document.body.appendChild(messageElement);
    jest.spyOn(testMessageBus, 'publish');
  });

  it('should create cardNumberInstance of class CardNumber', () => {
    expect(cardNumberInstance).toBeInstanceOf(CardNumber);
  });

  it('should create cardNumberInstance of class Input', () => {
    expect(cardNumberInstance).toBeInstanceOf(Input);
  });

  it('should have a label', () => {
    // @ts-ignore
    expect(cardNumberInstance.getLabel()).toBe('Card number');
  });

  it('should capture autocomplete and emit expiration date from autocomplete via message bus event', () => {
    const autocompleteCaptureExpirationDateInput: HTMLInputElement = document.querySelector('#st-card-number-input-autocomplete-capture-expiration-date');
    mockAutocompleteEvent(autocompleteCaptureExpirationDateInput, '12/2034');
    expect(testMessageBus.publish).toHaveBeenCalledWith({
        type: PUBLIC_EVENTS.AUTOCOMPLETE_EXPIRATION_DATE,
        data: '12/2034',
      },
      EventScope.ALL_FRAMES
    );
  });

  it('should capture autocomplete and emit security code from autocomplete via message bus event', () => {
    const autocompleteCaptureSecurityCodeInput: HTMLInputElement = document.querySelector('#st-card-number-input-autocomplete-capture-security-code');
    mockAutocompleteEvent(autocompleteCaptureSecurityCodeInput, '123');
    expect(testMessageBus.publish).toHaveBeenCalledWith({
        type: PUBLIC_EVENTS.AUTOCOMPLETE_SECURITY_CODE,
        data: '123',
      },
      EventScope.ALL_FRAMES
    );
  });

  it('if input has no value and event from other frame with card number from autocomplete is received, it should set input value to received value', () => {
    // cardNumberInput.value = null;
    // testMessageBus.publish({
    //   type: PUBLIC_EVENTS.AUTOCOMPLETE_CARD_NUMBER,
    //   data: cardNumberCorrect,
    // });
    //
    // expect(cardNumberInput.value).toEqual(cardNumberCorrect);

    cardNumberInput.value = '1234';
    testMessageBus.publish({
      type: PUBLIC_EVENTS.AUTOCOMPLETE_CARD_NUMBER,
      data: cardNumberCorrect,
    });
    expect(cardNumberInput.value).toEqual('1234');

  });

  describe('CardNumber._getCardNumberForBinProcess()', () => {
    it('should return input iframe-factory', () => {
      // @ts-ignore
      expect(CardNumber.getCardNumberForBinProcess('4111111111111111')).toEqual('411111');
    });
  });

  describe('CardNumber.ifFieldExists', () => {
    it('should return input iframe-factory', () => {
      expect(CardNumber.ifFieldExists()).toBeInstanceOf(HTMLInputElement);
    });
  });

  describe('CardNumber.getBinLookupDetails', () => {
    const { unrecognizedCardNumber, cardNumberCorrect, receivedObject } = cardNumberFixture();

    it('should return undefined if card is not recognized', () => {
      // @ts-ignore
      expect(cardNumberInstance.getBinLookupDetails(unrecognizedCardNumber)).toEqual(undefined);
    });

    it('should return binLookup object if card is recognized', () => {
      // @ts-ignore
      expect(cardNumberInstance.getBinLookupDetails(cardNumberCorrect)).toStrictEqual(receivedObject);
    });
  });

  describe('getMaxLengthOfCardNumber()', () => {
    const { cardNumberCorrect, unrecognizedCardNumber } = cardNumberFixture();
    const maxLengthOfCardNumber = 21;
    const numberOfWhitespaces = 0;

    it('should return max length of card number', () => {
      cardNumberInput.value = cardNumberCorrect;
      // @ts-ignore
      expect(cardNumberInstance.getMaxLengthOfCardNumber()).toEqual(maxLengthOfCardNumber);
    });

    it(`should return numberOfWhitespaces equals: ${numberOfWhitespaces} when cardFormat is not defined`, () => {
      cardNumberInput.value = unrecognizedCardNumber;
      // @ts-ignore
      expect(cardNumberInstance.getMaxLengthOfCardNumber()).toEqual(
        // @ts-ignore
        CardNumber.STANDARD_CARD_LENGTH
      );
    });
  });

  describe('getCardFormat()', () => {
    const { unrecognizedCardNumber, cardNumberCorrect, receivedObject } = cardNumberFixture();

    it('should return undefined if card format is not recognized', () => {
      // @ts-ignore
      expect(cardNumberInstance.getCardFormat(unrecognizedCardNumber)).toEqual(undefined);
    });

    it('should return card format regexp if card format is recognized', () => {
      // @ts-ignore
      expect(cardNumberInstance.getCardFormat(cardNumberCorrect)).toEqual(receivedObject.format);
    });
  });

  describe('getPossibleCardLength()', () => {
    const { unrecognizedCardNumber, cardNumberCorrect, receivedObject } = cardNumberFixture();

    it('should return undefined if card format is not recognized', () => {
      // @ts-ignore
      expect(cardNumberInstance.getPossibleCardLength(unrecognizedCardNumber)).toEqual(undefined);
    });

    it('should return possible card length if card format is recognized', () => {
      // @ts-ignore
      expect(cardNumberInstance.getPossibleCardLength(cardNumberCorrect)).toEqual(receivedObject.length);
    });
  });

  describe('getSecurityCodeLength()', () => {
    const { unrecognizedCardNumber, cardNumberCorrect, receivedObject } = cardNumberFixture();

    it('should return undefined if card format is not recognized', () => {
      // @ts-ignore
      expect(cardNumberInstance.getSecurityCodeLength(unrecognizedCardNumber)).toEqual(undefined);
    });

    it('should return possible cvc lengths if card format is recognized', () => {
      // @ts-ignore
      expect(cardNumberInstance.getSecurityCodeLength(cardNumberCorrect)).toEqual(receivedObject.cvcLength[0]);
    });
  });

  describe('_setDisableListener()', () => {
    function subscribeMock(state: FormState) {
      // @ts-ignore
      cardNumberInstance.messageBus.subscribeType = jest.fn().mockImplementation((event, callback) => {
        callback(state);
      });
      // @ts-ignore
      cardNumberInstance.setDisableListener();
    }

    it('should set attribute disabled', () => {
      subscribeMock(FormState.BLOCKED);
      // @ts-ignore
      expect(cardNumberInstance.inputElement.hasAttribute('disabled')).toEqual(true);
    });

    it('should add class st-input--disabled', () => {
      subscribeMock(FormState.BLOCKED);
      // @ts-ignore
      expect(cardNumberInstance.inputElement.classList.contains('st-input--disabled')).toEqual(true);
    });

    it('should remove attribute disabled', () => {
      subscribeMock(FormState.AVAILABLE);
      // @ts-ignore
      expect(cardNumberInstance.inputElement.hasAttribute('disabled')).toEqual(false);
    });

    it('should remove class st-input--disabled', () => {
      subscribeMock(FormState.AVAILABLE);
      // @ts-ignore
      expect(cardNumberInstance.inputElement.classList.contains('st-input--disabled')).toEqual(false);
    });
  });

  describe('onBlur', () => {
    beforeEach(() => {
      // @ts-ignore
      cardNumberInstance.validation.luhnCheck = jest.fn();
      // @ts-ignore
      cardNumberInstance.sendState = jest.fn();
      // @ts-ignore
      cardNumberInstance.onBlur();
    });

    it('should call Luhn check method with fieldInstance, inputElement and messageElement', () => {
      // @ts-ignore
      expect(cardNumberInstance.validation.luhnCheck).toHaveBeenCalledWith(
        // @ts-ignore
        cardNumberInstance.fieldInstance,
        // @ts-ignore
        cardNumberInstance.inputElement,
        // @ts-ignore
        cardNumberInstance.messageElement
      );
    });

    it('should call sendState method', () => {
      // @ts-ignore
      expect(cardNumberInstance.sendState).toHaveBeenCalled();
    });
  });

  describe('onFocus', () => {
    const event: Event = new Event('focus');

    beforeEach(() => {
      // @ts-ignore
      cardNumberInstance.disableSecurityCodeField = jest.fn();
      // @ts-ignore
      cardNumberInstance.inputElement.value = '4111';
      // @ts-ignore
      cardNumberInstance.inputElement.focus = jest.fn();
      // @ts-ignore
      cardNumberInstance.onFocus(event);
    });

    it('should call iframe-factory focus', () => {
      // @ts-ignore
      expect(cardNumberInstance.inputElement.focus).toBeCalled();
    });
  });

  describe('onInput', () => {
    const { cardNumberInstance } = cardNumberFixture();
    const event: Event = new Event('input');
    const autocompleteCaptureExpirationDateInput: HTMLInputElement = document.querySelector('#st-card-number-input-autocomplete-capture-expiration-date');
    const autocompleteCaptureSecurityCodeInput: HTMLInputElement = document.querySelector('#st-card-number-input-autocomplete-capture-security-code');

    beforeEach(() => {
      autocompleteCaptureExpirationDateInput.value = 'something';
      autocompleteCaptureSecurityCodeInput.value = 'something';
      // @ts-ignore
      cardNumberInstance.setInputValue = jest.fn();
      // @ts-ignore
      cardNumberInstance.sendState = jest.fn();
      // @ts-ignore
      cardNumberInstance.onInput(event);
    });

    it('should call _setInputValue method', () => {
      // @ts-ignore
      expect(cardNumberInstance.setInputValue).toHaveBeenCalled();
    });

    it('should call _sendState method', () => {
      // @ts-ignore
      expect(cardNumberInstance.sendState).toHaveBeenCalled();
    });

    it('should clear autocomplete capture inputs', () => {
      expect(autocompleteCaptureExpirationDateInput.value).toEqual('');
      expect(autocompleteCaptureSecurityCodeInput.value).toEqual('');
    });
  });

  describe('onKeydown()', () => {
    // @ts-ignore
    const event: KeyboardEvent = new KeyboardEvent('keydown', { keyCode: 13 });

    it('should call validation.luhnCheck and sendState if key is equal to Enter keycode', () => {
      // @ts-ignore
      cardNumberInstance.sendState = jest.fn();
      Validation.isEnter = jest.fn().mockReturnValueOnce(true);
      // @ts-ignore
      cardNumberInstance.onKeydown(event);
      // @ts-ignore
      expect(cardNumberInstance.validation.luhnCheck).toHaveBeenCalledWith(
        // @ts-ignore
        cardNumberInstance.cardNumberInput,
        // @ts-ignore
        cardNumberInstance.inputElement,
        // @ts-ignore
        cardNumberInstance.messageElement
      );
      // @ts-ignore
      expect(cardNumberInstance.sendState).toHaveBeenCalled();
    });
  });

  describe('onPaste()', () => {
    beforeEach(() => {
      const event = {
        clipboardData: {
          getData: jest.fn(),
        },
        preventDefault: jest.fn(),
      };
      Utils.stripChars = jest.fn().mockReturnValue('41111');
      // @ts-ignore
      cardNumberInstance.sendState = jest.fn();
      // @ts-ignore
      cardNumberInstance.setInputValue = jest.fn();
      // @ts-ignore
      cardNumberInstance.onPaste(event);
    });

    it('should call setInputValue and _sendState methods', () => {
      // @ts-ignore
      expect(cardNumberInstance.setInputValue).toHaveBeenCalled();
      // @ts-ignore
      expect(cardNumberInstance.sendState).toHaveBeenCalled();
    });
  });

  describe('_getMaxLengthOfCardNumber()', () => {
    const panLengthWithoutSpaces = 15;
    const numberOfWhitespaces = 3;

    beforeEach(() => {
      // @ts-ignore
      cardNumberInstance.inputElement.value = '4111111111';
    });

    it('should return max length of card number including whitespaces', () => {
      Utils.getLastElementOfArray = jest.fn().mockReturnValueOnce(panLengthWithoutSpaces);
      // @ts-ignore
      expect(cardNumberInstance.getMaxLengthOfCardNumber()).toEqual(panLengthWithoutSpaces + numberOfWhitespaces);
    });
  });
});

function cardNumberFixture() {
  const html =
    '<form id="st-card-number" class="card-number" novalidate=""><label id="st-card-number-label" for="st-card-number-input" class="card-number__label card-number__label--required">Card number</label><input id="st-card-number-input" class="card-number__input" type="text" autocomplete="off" required="" data-luhn-check="true" maxlength="NaN" minlength="19"><p id="st-card-number-message" class="card-number__message"></p><div class="card-number__autocomplete">     <input id="st-card-number-input-autocomplete-capture-expiration-date" type="text" autocomplete="cc-exp" tabindex="-1" inputmode="none" /><input id="st-card-number-input-autocomplete-capture-security-code" type="text" autocomplete="cc-csc" tabindex="-1" inputmode="none" /> </div></form>';
  document.body.innerHTML = html;
  const configProvider: ConfigProvider = mock<ConfigProvider>();
  const iconFactory: IconFactory = mock(IconFactory);
  const formatter: Formatter = mock(Formatter);
  const validationFactory: ValidationFactory = mock(ValidationFactory);
  const mockValidation: Validation = mock(Validation);
  const container: ContainerInstance = mock(ContainerInstance);

  when(container.get(MessageBusToken)).thenReturn(testMessageBus);
  when(validationFactory.create()).thenReturn(mockInstance(mockValidation))

  when(configProvider.getConfig$()).thenReturn(of({} as IConfig));
  // @ts-ignore
  when(configProvider.getConfig()).thenReturn({
    jwt: '',
    disableNotification: false,
    placeholders: { pan: 'Card number', expirydate: 'MM/YY', securitycode: '***' },
  });

  const cardNumberInstance: CardNumber = new CardNumber(
    instance(configProvider),
    instance(iconFactory),
    instance(formatter),
    instance(validationFactory),
    instance(container)
  );

  function createElement(markup: string) {
    return document.createElement(markup);
  }

  const inputElement = createElement('input');
  const labelElement = document.createElement('label');
  const messageElement = createElement('p');
  const cardNumberCorrect = '3000 000000 000111';
  const unrecognizedCardNumber = '8989 8989 6899 9999';
  const receivedObject = {
    cvcLength: [3],
    format: '(\\d{1,4})(\\d{1,6})?(\\d+)?',
    length: [14, 15, 16, 17, 18, 19],
    luhn: true,
    type: 'DINERS',
  };
  const testCardNumbers = [
    ['', 0],
    ['0000000000000000', 0],
    ['4111111111111111', true],
    ['79927398713', true],
    ['6759555555555555', false],
  ];
  const formattedCards = [
    ['340000000000611', '3400 000000 00611'],
    ['1801000000000901', '1801 0000 0000 0901'],
    ['3000000000000111', '3000 000000 000111'],
    ['6011000000000301', '6011 0000 0000 0301'],
    ['3528000000000411', '3528 0000 0000 0411'],
    ['5000000000000611', '5000 0000 0000 0611'],
    ['5100000000000511', '5100 0000 0000 0511'],
    ['3089500000000000021', '3089 5000 0000 0000021'],
    ['4111110000000211', '4111 1100 0000 0211'],
    ['123456789', '123456789'],
  ];
  labelElement.id = CARD_NUMBER_LABEL;
  inputElement.id = CARD_NUMBER_INPUT;
  messageElement.id = CARD_NUMBER_MESSAGE;

  return {
    cardNumberInstance,
    inputElement,
    labelElement,
    messageElement,
    testCardNumbers,
    formattedCards,
    unrecognizedCardNumber,
    cardNumberCorrect,
    receivedObject,
  };
}

function mockAutocompleteEvent(input: HTMLInputElement, value: string) {
  input.value = value;
  input.dispatchEvent(new Event('input'));
}
