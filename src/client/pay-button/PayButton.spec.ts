import { instance, mock, when } from 'ts-mockito';
import { of } from 'rxjs';
import { SimpleMessageBus } from '../../application/core/shared/message-bus/SimpleMessageBus';
import { Translator } from '../../application/core/shared/translator/Translator';
import { ConfigProvider } from '../../shared/services/config-provider/ConfigProvider';
import { FormState } from '../../application/core/models/constants/FormState';
import { PUBLIC_EVENTS } from '../../application/core/models/constants/EventTypes';
import { PAY } from '../../application/core/models/constants/Translations';
import { PayButton } from './PayButton';
import Mock = jest.Mock;

describe('PayButton', () => {
  let sut: PayButton;
  let translatorMock: Translator;
  let configProviderMock;
  let messageBus;
  const config = {
    jwt: '',
    formId: 'st-form',
  };
  let buttonElement: HTMLElement;
  let handler: Mock;

  beforeAll(() => {
    document.body.innerHTML =
      '<form id="st-form" class="example-form" autocomplete="off" novalidate><button type="submit" id="test-id">Pay</button></form>';
  });

  beforeEach(() => {
    buttonElement = document.getElementById('test-id');
    handler = jest.fn();
    configProviderMock = mock<ConfigProvider>();
    translatorMock = mock(Translator);
    messageBus = new SimpleMessageBus();
    when(configProviderMock.getConfig()).thenReturn(config);
    when(configProviderMock.getConfig$()).thenReturn(of(config));
    when(translatorMock.translate(PAY)).thenReturn('Zahlen');
    sut = new PayButton(instance(configProviderMock), instance(translatorMock), messageBus);
    sut.init();
  });

  it.each([
    FormState.BLOCKED,
    FormState.LOADING,
    FormState.COMPLETE,
  ])(`should find a button in form, disable it and add a class st-button-submit__disabled when FormState has a certain value not equal ${FormState.AVAILABLE}`, state => {
    sut.disable(state);

    expect(buttonElement.getAttribute('disabled')).toEqual('');

    expect(buttonElement.getAttribute('class')).toEqual('st-button-submit__disabled');
  });

  it(`should make button available when FormStatus equals ${FormState.AVAILABLE}`, () => {
    sut.disable(FormState.AVAILABLE);

    expect(buttonElement.getAttribute('disabled')).toEqual(null);

    expect(buttonElement.getAttribute('class')).toEqual('');
  });

  it('should add click handler', () => {
    jest.spyOn(buttonElement, 'addEventListener');
    sut.addClickHandler(handler);

    buttonElement.click();
    expect(buttonElement.addEventListener).toHaveBeenCalledTimes(1);
  });

  it('should remove click handler', () => {
    jest.spyOn(buttonElement, 'addEventListener');
    jest.spyOn(buttonElement, 'removeEventListener');
    sut.addClickHandler(handler);
    sut.removeClickHandler(handler);

    buttonElement.click();
    expect(buttonElement.addEventListener).toHaveBeenCalledTimes(1);
    expect(buttonElement.removeEventListener).toHaveBeenCalledTimes(1);
  });

  it(`should block button during loading an application, then unlock the submit button when ${PUBLIC_EVENTS.UNLOCK_BUTTON} event is called`, () => {

    expect(buttonElement.getAttribute('disabled')).toEqual('');

    expect(buttonElement.getAttribute('class')).toEqual('st-button-submit__disabled');
    messageBus.publish({ type: PUBLIC_EVENTS.UNLOCK_BUTTON });

    expect(buttonElement.getAttribute('disabled')).toEqual(null);

    expect(buttonElement.getAttribute('class')).toEqual('');
  });

  it(`should change buttons translation when ${PUBLIC_EVENTS.LOCALE_CHANGED} has been called`, () => {
    expect(buttonElement.textContent).toEqual('Zahlen')
  });
});
