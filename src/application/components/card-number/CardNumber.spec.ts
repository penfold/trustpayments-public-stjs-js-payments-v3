import { CardNumber } from './CardNumber';
import { FormState } from '../../core/models/constants/FormState';
import { CARD_NUMBER_INPUT, CARD_NUMBER_LABEL, CARD_NUMBER_MESSAGE } from '../../core/models/constants/Selectors';
import { Input } from '../../core/shared/input/Input';
import { Utils } from '../../core/shared/utils/Utils';
import { Validation } from '../../core/shared/validation/Validation';
import { instance, mock, when } from 'ts-mockito';
import { IconFactory } from '../../core/services/icon/IconFactory';
import { ConfigProvider } from '../../../shared/services/config-provider/ConfigProvider';
import { Frame } from '../../core/shared/frame/Frame';
import { Formatter } from '../../core/shared/formatter/Formatter';
import { of } from 'rxjs';
import { IConfig } from '../../../shared/model/config/IConfig';
import { IMessageBus } from '../../core/shared/message-bus/IMessageBus';
import { SimpleMessageBus } from '../../core/shared/message-bus/SimpleMessageBus';
import Container from 'typedi';
import { TranslatorToken } from '../../../shared/dependency-injection/InjectionTokens';
import { Translator } from '../../core/shared/translator/Translator';
import { ITranslationProvider } from '../../core/shared/translator/ITranslationProvider';
import { TranslationProvider } from '../../core/shared/translator/TranslationProvider';
import { ITranslator } from '../../core/shared/translator/ITranslator';
import { TestConfigProvider } from '../../../testing/mocks/TestConfigProvider';

jest.mock('./../../core/shared/validation/Validation');

Container.set({ id: ConfigProvider, type: TestConfigProvider });
Container.set({ id: TranslatorToken, type: Translator });
Container.set({ id: ITranslationProvider, type: TranslationProvider });

describe('CardNumber', () => {
  const { inputElement, messageElement, cardNumberInstance, labelElement } = cardNumberFixture();

  beforeAll(() => {
    document.body.appendChild(inputElement);
    document.body.appendChild(labelElement);
    document.body.appendChild(messageElement);
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

  describe('CardNumber._getCardNumberForBinProcess()', () => {
    it('should return input iframe-factory', () => {
      // @ts-ignore
      expect(CardNumber._getCardNumberForBinProcess('4111111111111111')).toEqual('411111');
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
      expect(cardNumberInstance._getBinLookupDetails(unrecognizedCardNumber)).toEqual(undefined);
    });

    it('should return binLookup object if card is recognized', () => {
      // @ts-ignore
      expect(cardNumberInstance._getBinLookupDetails(cardNumberCorrect)).toStrictEqual(receivedObject);
    });
  });

  describe('getMaxLengthOfCardNumber()', () => {
    const { cardNumberCorrect, unrecognizedCardNumber } = cardNumberFixture();
    const maxLengthOfCardNumber = 19;
    const numberOfWhitespaces = 0;

    it('should return max length of card number', () => {
      // @ts-ignore
      expect(cardNumberInstance._getMaxLengthOfCardNumber(cardNumberCorrect)).toEqual(maxLengthOfCardNumber);
    });

    it(`should return numberOfWhitespaces equals: ${numberOfWhitespaces} when cardFormat is not defined`, () => {
      // @ts-ignore
      expect(cardNumberInstance._getMaxLengthOfCardNumber(unrecognizedCardNumber)).toEqual(
        // @ts-ignore
        CardNumber.STANDARD_CARD_LENGTH
      );
    });
  });

  describe('getCardFormat()', () => {
    const { unrecognizedCardNumber, cardNumberCorrect, receivedObject } = cardNumberFixture();

    it('should return undefined if card format is not recognized', () => {
      // @ts-ignore
      expect(cardNumberInstance._getCardFormat(unrecognizedCardNumber)).toEqual(undefined);
    });

    it('should return card format regexp if card format is recognized', () => {
      // @ts-ignore
      expect(cardNumberInstance._getCardFormat(cardNumberCorrect)).toEqual(receivedObject.format);
    });
  });

  describe('getPossibleCardLength()', () => {
    const { unrecognizedCardNumber, cardNumberCorrect, receivedObject } = cardNumberFixture();

    it('should return undefined if card format is not recognized', () => {
      // @ts-ignore
      expect(cardNumberInstance._getPossibleCardLength(unrecognizedCardNumber)).toEqual(undefined);
    });

    it('should return possible card length if card format is recognized', () => {
      // @ts-ignore
      expect(cardNumberInstance._getPossibleCardLength(cardNumberCorrect)).toEqual(receivedObject.length);
    });
  });

  describe('getSecurityCodeLength()', () => {
    const { unrecognizedCardNumber, cardNumberCorrect, receivedObject } = cardNumberFixture();

    it('should return undefined if card format is not recognized', () => {
      // @ts-ignore
      expect(cardNumberInstance._getSecurityCodeLength(unrecognizedCardNumber)).toEqual(undefined);
    });

    it('should return possible cvc lengths if card format is recognized', () => {
      // @ts-ignore
      expect(cardNumberInstance._getSecurityCodeLength(cardNumberCorrect)).toEqual(receivedObject.cvcLength[0]);
    });
  });

  describe('_setDisableListener()', () => {
    function subscribeMock(state: FormState) {
      // @ts-ignore
      cardNumberInstance.messageBus.subscribeType = jest.fn().mockImplementation((event, callback) => {
        callback(state);
      });
      // @ts-ignore
      cardNumberInstance._setDisableListener();
    }

    it('should set attribute disabled', () => {
      subscribeMock(FormState.BLOCKED);
      // @ts-ignore
      expect(cardNumberInstance._inputElement.hasAttribute('disabled')).toEqual(true);
    });

    it('should add class st-input--disabled', () => {
      subscribeMock(FormState.BLOCKED);
      // @ts-ignore
      expect(cardNumberInstance._inputElement.classList.contains('st-input--disabled')).toEqual(true);
    });

    it('should remove attribute disabled', () => {
      subscribeMock(FormState.AVAILABLE);
      // @ts-ignore
      expect(cardNumberInstance._inputElement.hasAttribute('disabled')).toEqual(false);
    });

    it('should remove class st-input--disabled', () => {
      subscribeMock(FormState.AVAILABLE);
      // @ts-ignore
      expect(cardNumberInstance._inputElement.classList.contains('st-input--disabled')).toEqual(false);
    });
  });

  describe('onBlur', () => {
    beforeEach(() => {
      cardNumberInstance.validation.luhnCheck = jest.fn();
      // @ts-ignore
      cardNumberInstance._sendState = jest.fn();
      // @ts-ignore
      cardNumberInstance.onBlur();
    });

    it('should call Luhn check method with fieldInstance, inputElement and messageElement', () => {
      // @ts-ignore
      expect(cardNumberInstance.validation.luhnCheck).toHaveBeenCalledWith(
        // @ts-ignore
        cardNumberInstance._fieldInstance,
        // @ts-ignore
        cardNumberInstance._inputElement,
        // @ts-ignore
        cardNumberInstance._messageElement
      );
    });

    it('should call sendState method', () => {
      // @ts-ignore
      expect(cardNumberInstance._sendState).toHaveBeenCalled();
    });
  });

  describe('onFocus', () => {
    const event: Event = new Event('focus');

    beforeEach(() => {
      // @ts-ignore
      cardNumberInstance._disableSecurityCodeField = jest.fn();
      // @ts-ignore
      cardNumberInstance._inputElement.value = '4111';
      // @ts-ignore
      cardNumberInstance._inputElement.focus = jest.fn();
      // @ts-ignore
      cardNumberInstance.onFocus(event);
    });

    it('should call iframe-factory focus', () => {
      // @ts-ignore
      expect(cardNumberInstance._inputElement.focus).toBeCalled();
    });

    it('should call _disableSecurityCodeField with input value', () => {
      // @ts-ignore
      expect(cardNumberInstance._disableSecurityCodeField).toHaveBeenCalledWith('4111');
    });
  });

  describe('onInput', () => {
    const event: Event = new Event('input');

    beforeEach(() => {
      // @ts-ignore
      cardNumberInstance._setInputValue = jest.fn();
      // @ts-ignore
      cardNumberInstance._sendState = jest.fn();
      // @ts-ignore
      cardNumberInstance.onInput(event);
    });

    it('should call _setInputValue method', () => {
      // @ts-ignore
      expect(cardNumberInstance._setInputValue).toHaveBeenCalled();
    });

    it('should call _sendState method', () => {
      // @ts-ignore
      expect(cardNumberInstance._sendState).toHaveBeenCalled();
    });
  });

  describe('onKeydown()', () => {
    // @ts-ignore
    const event: KeyboardEvent = new KeyboardEvent('keydown', { keyCode: 13 });

    it('should call validation.luhnCheck and sendState if key is equal to Enter keycode', () => {
      // @ts-ignore
      cardNumberInstance._sendState = jest.fn();
      Validation.isEnter = jest.fn().mockReturnValueOnce(true);
      // @ts-ignore
      cardNumberInstance.onKeydown(event);
      expect(cardNumberInstance.validation.luhnCheck).toHaveBeenCalledWith(
        // @ts-ignore
        cardNumberInstance._cardNumberInput,
        // @ts-ignore
        cardNumberInstance._inputElement,
        // @ts-ignore
        cardNumberInstance._messageElement
      );
      // @ts-ignore
      expect(cardNumberInstance._sendState).toHaveBeenCalled();
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
      cardNumberInstance._sendState = jest.fn();
      // @ts-ignore
      cardNumberInstance._setInputValue = jest.fn();
      // @ts-ignore
      cardNumberInstance.onPaste(event);
    });

    it('should call setInputValue and _sendState methods', () => {
      // @ts-ignore
      expect(cardNumberInstance._setInputValue).toHaveBeenCalled();
      // @ts-ignore
      expect(cardNumberInstance._sendState).toHaveBeenCalled();
    });
  });

  describe('_getMaxLengthOfCardNumber()', () => {
    const panLengthWithoutSpaces = 15;
    const numberOfWhitespaces = 3;

    beforeEach(() => {
      // @ts-ignore
      cardNumberInstance._inputElement.value = '4111111111';
    });

    it('should return max length of card number including whitespaces', () => {
      Utils.getLastElementOfArray = jest.fn().mockReturnValueOnce(panLengthWithoutSpaces);
      // @ts-ignore
      expect(cardNumberInstance._getMaxLengthOfCardNumber()).toEqual(panLengthWithoutSpaces + numberOfWhitespaces);
    });
  });
});

function cardNumberFixture() {
  const html =
    '<form id="st-card-number" class="card-number" novalidate=""><label id="st-card-number-label" for="st-card-number-input" class="card-number__label card-number__label--required">Card number</label><input id="st-card-number-input" class="card-number__input" type="text" autocomplete="off" required="" data-luhn-check="true" maxlength="NaN" minlength="19"><p id="st-card-number-message" class="card-number__message"></p></form>';
  document.body.innerHTML = html;
  const configProvider: ConfigProvider = mock<ConfigProvider>();
  const iconFactory: IconFactory = mock(IconFactory);
  const frame: Frame = mock(Frame);
  const formatter: Formatter = mock(Formatter);
  const translator: ITranslator = mock(Translator);
  const messageBus: IMessageBus = new SimpleMessageBus();
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
    instance(frame),
    messageBus,
    instance(translator)
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
