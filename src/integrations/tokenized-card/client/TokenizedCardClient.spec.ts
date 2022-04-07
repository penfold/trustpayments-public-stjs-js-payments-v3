import { instance, mock } from 'ts-mockito';
import { Store } from '../../../application/core/store/store/Store';
import { IframeFactory } from '../../../client/iframe-factory/IframeFactory';
import { JwtDecoder } from '../../../shared/services/jwt-decoder/JwtDecoder';
import { SimpleMessageBus } from '../../../application/core/shared/message-bus/SimpleMessageBus';
import { PayButtonFactory } from '../../../client/pay-button/PayButtonFactory';
import { ITokenizedCardPaymentConfig } from '../models/ITokenizedCardPayment';
import { PayButton } from '../../../client/pay-button/PayButton';
import { FormState } from '../../../application/core/models/constants/FormState';
import { EventScope } from '../../../application/core/models/constants/EventScope';
import { MessageBus } from '../../../application/core/shared/message-bus/MessageBus';
import { TokenizedCardClient } from './TokenizedCardClient';

const testMessageBus = new SimpleMessageBus();

let tokenizedCardClientInstance: TokenizedCardClient

const tokenizedCardConfig: ITokenizedCardPaymentConfig  = {
  formId: 'st-form-tokenized',
  securityCodeSlotId: 'st-tokenized-security-code',
  buttonId: 'tokenized-submit-button',
}

describe('TokenizedCardClient', () => {
  describe('on init()', () => {
    beforeEach(() => {
      tokenizedCardClientInstance = tokenizedCardClientFixture()
      tokenizedCardClientInstance.init(tokenizedCardConfig)
    })

    it('should insert security code iframe', () => {
      const securityCodeIframe = document.querySelector('#st-tokenized-security-code iframe')
      expect(securityCodeIframe).toBeTruthy()
    })

    it('should prevent the form from submit', () => {
      const form = document.querySelector('#st-form-tokenized') as HTMLFormElement

      const submitMock = new Event('submit')
      submitMock.preventDefault = jest.fn()

      form.dispatchEvent(submitMock)

      expect(submitMock.preventDefault).toBeCalled()
    })

    it('should set disable listener', () => {
      testMessageBus.publish({
        type: MessageBus.EVENTS_PUBLIC.BLOCK_FORM,
        data: FormState.BLOCKED,
      },  EventScope.ALL_FRAMES);

      const button = document.querySelector('#tokenized-submit-button') as HTMLButtonElement
      expect(button.disabled).toBeTruthy()
    })
  })
})

function tokenizedCardClientFixture() {
  document.body.innerHTML = `
    <form role="form" name="st-form-tokenized" id="st-form-tokenized" action="https://www.example.com" class="st-form" autocomplete="off" novalidate="">
      <fieldset id="st-card-payment" class="st-form__fieldset">
        <legend>Credit card details:</legend>
        <div id="st-tokenized-security-code" class="st-form__group st-form__iframe-container"></div>
      </fieldset>
      <div class="st-form__group st-form__group--submit">
        <button type="submit" class="st-form__button" id="tokenized-submit-button">Pay</button>
      </div>
    </form>
  `;

  const storeMock = instance(mock(Store))
  const iframeFactoryMock = instance(mock(IframeFactory))
  const jwtDecoderMock = instance(mock(JwtDecoder))
  const payButtonFactoryMock = instance(mock(PayButtonFactory))
  const payButtonMock = instance(mock(PayButton))

  jwtDecoderMock.decode = jest.fn().mockReturnValue({ payload: {
      locale: 'gb_GB',
    },
  })

  storeMock.getState = jest.fn().mockReturnValue({
      initialConfig: {
        config: {
          origin: 'Test',
        },
      },
  })

  iframeFactoryMock.create = jest.fn().mockReturnValue(document.createElement('iframe'))

  payButtonFactoryMock.create = jest.fn().mockReturnValue(payButtonMock)

  payButtonMock.disable = jest.fn().mockImplementation((event) => {
    if(event === FormState.AVAILABLE) {
      const button = document.querySelector('#tokenized-submit-button') as HTMLButtonElement
      button.disabled = false
    }

    if(event != FormState.AVAILABLE){
      const button = document.querySelector('#tokenized-submit-button') as HTMLButtonElement
      button.disabled = true
    }
  })

  return new TokenizedCardClient(iframeFactoryMock, jwtDecoderMock, testMessageBus, payButtonFactoryMock, storeMock);
}
