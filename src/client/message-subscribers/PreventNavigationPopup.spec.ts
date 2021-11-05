import { anyFunction, instance, mock, verify } from 'ts-mockito';
import { PUBLIC_EVENTS } from '../../application/core/models/constants/EventTypes';
import { SimpleMessageBus } from '../../application/core/shared/message-bus/SimpleMessageBus';
import { IMessageBus } from '../../application/core/shared/message-bus/IMessageBus';
import { PreventNavigationPopup } from './PreventNavigationPopup';

describe('PreventNavigationPopup', () => {
  let windowMock: Window;
  let messageBus: IMessageBus;
  let preventNavigationPopup: PreventNavigationPopup;

  beforeEach(() => {
    windowMock = mock<Window>();
    messageBus = new SimpleMessageBus();
    preventNavigationPopup = new PreventNavigationPopup(instance(windowMock));
    preventNavigationPopup.register(messageBus);
  });

  it('registers onbeforeunload listener on form submit', () => {
    messageBus.publish({ type: PUBLIC_EVENTS.SUBMIT_FORM, data: {} });

    verify(windowMock.addEventListener('beforeunload', anyFunction())).once();
  });

  it('unregisters onbeforeunload listener on transaction complete', () => {
    messageBus.publish({ type: PUBLIC_EVENTS.CALL_MERCHANT_SUBMIT_CALLBACK, data: {} });

    verify(windowMock.removeEventListener('beforeunload', anyFunction())).once();
  });

  it('unregisters onbeforeunload listener on component destroy', () => {
    messageBus.publish({ type: PUBLIC_EVENTS.DESTROY, data: {} });

    verify(windowMock.removeEventListener('beforeunload', anyFunction())).once();
  });
});
