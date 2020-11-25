import { CommonFrames } from './CommonFrames.class';
import { MessageBus } from '../../application/core/shared/message-bus/MessageBus';
import {
  ANIMATED_CARD_INPUT_SELECTOR,
  CARD_NUMBER_INPUT_SELECTOR,
  EXPIRATION_DATE_INPUT_SELECTOR,
  SECURITY_CODE_INPUT_SELECTOR
} from '../../application/core/models/constants/Selectors';
import { MessageBusMock } from '../../testing/mocks/MessageBusMock';
import { PUBLIC_EVENTS } from '../../application/core/models/constants/EventTypes';
import { IframeFactory } from '../iframe-factory/IframeFactory';
import { anyString, instance as instanceOf, mock, when } from 'ts-mockito';
import { Frame } from '../../application/core/shared/frame/Frame';
import { CustomerOutput } from '../../application/core/models/constants/CustomerOutput';

jest.mock('./../../application/core/shared/notification/Notification');

describe('CommonFrames', () => {
  describe('_isTransactionFinished()', () => {
    let instance: CommonFrames;

    beforeEach(() => {
      instance = commonFramesFixture().instance;
    });

    it('should be finished if errorcode is not 0', () => {
      expect(
        // @ts-ignore
        instance._isTransactionFinished({
          errorcode: '30000',
          requesttypedescription: 'AUTH',
          customeroutput: CustomerOutput.TRYAGAIN
        })
      ).toEqual(true);
    });

    it('should be finished if current response has certain customeroutput values', () => {
      expect(
        // @ts-ignore
        instance._isTransactionFinished({
          errorcode: '0',
          requesttypedescription: 'BBB',
          customeroutput: CustomerOutput.RESULT
        })
      ).toEqual(true);

      expect(
        // @ts-ignore
        instance._isTransactionFinished({
          errorcode: '0',
          requesttypedescription: 'BBB',
          customeroutput: CustomerOutput.TRYAGAIN
        })
      ).toEqual(true);
    });

    it('should be finished if current response has threedresponse available', () => {
      expect(
        // @ts-ignore
        instance._isTransactionFinished({
          errorcode: '0',
          requesttypedescription: 'THREEDQUERY',
          customeroutput: CustomerOutput.THREEDREDIRECT,
          enrolled: 'Y',
          threedresponse: 'foobar'
        })
      ).toEqual(true);
    });

    it('should be finished if current response has enrolled other than Y', () => {
      expect(
        // @ts-ignore
        instance._isTransactionFinished({
          errorcode: '0',
          requesttypedescription: 'THREEDQUERY',
          customeroutput: CustomerOutput.THREEDREDIRECT,
          enrolled: 'N'
        })
      ).toEqual(true);

      expect(
        // @ts-ignore
        instance._isTransactionFinished({
          errorcode: '0',
          requesttypedescription: 'THREEDQUERY',
          customeroutput: CustomerOutput.THREEDREDIRECT,
          enrolled: 'U'
        })
      ).toEqual(true);
    });

    it('should be finished if current response is frictionless payment (no acsurl)', () => {
      expect(
        // @ts-ignore
        instance._isTransactionFinished({
          errorcode: '0',
          requesttypedescription: 'THREEDQUERY',
          customeroutput: CustomerOutput.THREEDREDIRECT,
          enrolled: 'Y'
        })
      ).toEqual(true);
    });

    it('should not be finished if current response has acsurl', () => {
      expect(
        // @ts-ignore
        instance._isTransactionFinished({
          errorcode: '0',
          requesttypedescription: 'THREEDQUERY',
          customeroutput: CustomerOutput.THREEDREDIRECT,
          enrolled: 'Y',
          acsurl: 'https://acs.com'
        })
      ).toEqual(false);
    });

    it('should not be finished if current response type is WALLETVERIFY or JSINIT', () => {
      expect(
        // @ts-ignore
        instance._isTransactionFinished({
          errorcode: '0',
          requesttypedescription: 'WALLETVERIFY',
          customeroutput: 'RESULT'
        })
      ).toEqual(false);

      expect(
        // @ts-ignore
        instance._isTransactionFinished({
          errorcode: '0',
          requesttypedescription: 'JSINIT',
          customeroutput: 'RESULT'
        })
      ).toEqual(false);
    });

    it('should be finished if current response has no customeroutput', () => {
      expect(
        // @ts-ignore
        instance._isTransactionFinished({
          errorcode: '0',
          requesttypedescription: 'RISKDEC'
        })
      ).toEqual(true);
    });
  });

  describe('_getSubmitFields()', () => {
    const { instance } = commonFramesFixture();

    function getSubmitFieldsFixture(dataArg: {}, submitFields: string[]) {
      const data = { ...dataArg };
      // @ts-ignore
      instance._submitFields = [...submitFields];
      // @ts-ignore
      return instance._getSubmitFields(data);
    }

    it('should return submit fields', () => {
      expect(getSubmitFieldsFixture({ something: 'a value' }, ['a', 'b', 'c'])).toEqual(['a', 'b', 'c']);
    });

    it('should return submit fields plus jwt', () => {
      expect(
        getSubmitFieldsFixture(
          {
            something: 'a value',
            jwt: 'a value'
          },
          ['a', 'b', 'c']
        )
      ).toEqual(['a', 'b', 'c', 'jwt']);
    });

    it('should return submit fields plus jwt and threedresponse', () => {
      expect(
        getSubmitFieldsFixture(
          {
            something: 'a value',
            jwt: 'a value',
            threedresponse: 'acs response'
          },
          ['a', 'b', 'c']
        )
      ).toEqual(['a', 'b', 'c', 'jwt', 'threedresponse']);
    });
  });

  describe('_onInput()', () => {
    const { instance } = commonFramesFixture();
    const event = new Event('input');
    const messageBusEvent = {
      data: {},
      type: MessageBus.EVENTS_PUBLIC.UPDATE_MERCHANT_FIELDS
    };

    beforeEach(() => {
      // @ts-ignore
      instance._messageBus.publish = jest.fn();
      // @ts-ignore
      instance._onInput(event);
    });

    it('should publish has been called', () => {
      // @ts-ignore
      expect(instance._messageBus.publish).toHaveBeenCalledWith(messageBusEvent);
    });
  });

  describe('_setTransactionCompleteListener()', () => {
    const { instance } = commonFramesFixture();
    const data = {
      errorcode: '0',
      errormessage: 'Ok'
    };
    const messageBus: MessageBus = (new MessageBusMock() as unknown) as MessageBus;

    beforeEach(() => {
      // @ts-ignore
      instance._messageBus = messageBus;
      // @ts-ignore
      instance._onTransactionComplete = jest.fn();
    });

    it('should call _merchantForm() method', () => {
      // @ts-ignore
      instance._setTransactionCompleteListener();

      messageBus.publish({ type: PUBLIC_EVENTS.TRANSACTION_COMPLETE, data });

      // @ts-ignore
      expect(instance._onTransactionComplete).toHaveBeenCalled();
    });
  });
});

function commonFramesFixture() {
  document.body.innerHTML =
    '<form id="st-form" class="example-form"> <h1 class="example-form__title"> Secure Trading<span>AMOUNT: <strong>10.00 GBP</strong></span> </h1> <div class="example-form__section example-form__section--horizontal"> <div class="example-form__group"> <label for="example-form-name" class="example-form__label example-form__label--required">NAME</label> <input id="example-form-name" class="example-form__input" type="text" placeholder="John Doe" autocomplete="name" /> </div> <div class="example-form__group"> <label for="example-form-email" class="example-form__label example-form__label--required">E-MAIL</label> <input id="example-form-email" class="example-form__input" type="email" placeholder="test@mail.com" autocomplete="email" /> </div> <div class="example-form__group"> <label for="example-form-phone" class="example-form__label example-form__label--required">PHONE</label> <input id="example-form-phone" class="example-form__input" type="tel" placeholder="+00 000 000 000" autocomplete="tel" /> </div> </div> <div class="example-form__spacer"></div> <div class="example-form__section"> <div id="st-notification-frame" class="example-form__group"></div> <div id="st-card-number" class="example-form__group"></div> <div id="st-expiration-date" class="example-form__group"></div> <div id="st-security-code" class="example-form__group"></div> <div id="st-error-container" class="example-form__group"></div> <div class="example-form__spacer"></div> </div> <div class="example-form__section"> <div class="example-form__group"> <button type="submit" class="example-form__button">PAY</button> </div> </div> <div class="example-form__section"> <div id="st-control-frame" class="example-form__group"></div> <div id="st-visa-checkout" class="example-form__group"></div> <div id="st-apple-pay" class="example-form__group"></div> </div> <div id="st-animated-card" class="st-animated-card-wrapper"></div> </form>';
  const jwt: string =
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhbTAzMTAuYXV0b2FwaSIsImlhdCI6MTU2MDk0NjM4Ny4yNDIzMzQ0LCJwYXlsb2FkIjp7ImJhc2VhbW91bnQiOiIxMDAwIiwiYWNjb3VudHR5cGVkZXNjcmlwdGlvbiI6IkVDT00iLCJjdXJyZW5jeWlzbzNhIjoiR0JQIiwic2l0ZXJlZmVyZW5jZSI6InRlc3RfamFtZXMzODY0MSIsImxvY2FsZSI6ImVuX0dCIiwicGFuIjoiNDExMTExMTExMTExMTExMSIsImV4cGlyeWRhdGUiOiIwMS8yMCIsInNlY3VyaXR5Y29kZSI6IjEyMyJ9fQ.UssdRcocpaeAqd-jDXpxWeWiKIX-W7zlpy0UWrDE5vg';
  const origin: string = 'https://example.com';
  const componentsIds = {
    animatedCard: ANIMATED_CARD_INPUT_SELECTOR,
    cardNumber: CARD_NUMBER_INPUT_SELECTOR,
    expirationDate: EXPIRATION_DATE_INPUT_SELECTOR,
    securityCode: SECURITY_CODE_INPUT_SELECTOR
  };
  const animatedCard = true;
  const gatewayUrl: string = 'https://webservices.securetrading.net/jwt/';
  let iframeFactory: IframeFactory;
  iframeFactory = mock(IframeFactory);
  const frame: Frame = mock(Frame);
  when(iframeFactory.create(anyString(), anyString())).thenCall((name: string, id: string) => {
    const iframe: HTMLIFrameElement = document.createElement('iframe');
    iframe.setAttribute('name', name);
    iframe.setAttribute('id', id);
    return iframe;
  });

  when(frame.parseUrl()).thenReturn({ params: { locale: 'en_GB' } });

  const instance = new CommonFrames(
    jwt,
    origin,
    componentsIds,
    {},
    false,
    false,
    false,
    [],
    gatewayUrl,
    animatedCard,
    ['AUTH'],
    'st-form',
    instanceOf(iframeFactory),
    instanceOf(frame)
  );

  return { instance };
}
