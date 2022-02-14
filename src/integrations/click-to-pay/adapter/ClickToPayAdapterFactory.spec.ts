import { instance, mock } from 'ts-mockito';
import { IMessageBus } from '../../../application/core/shared/message-bus/IMessageBus';
import { IFrameQueryingService } from '../../../shared/services/message-bus/interfaces/IFrameQueryingService';
import { DigitalTerminal } from '../digital-terminal/DigitalTerminal';
import { ClickToPayAdapterFactory } from './ClickToPayAdapterFactory';
import { ClickToPayAdapterName } from './ClickToPayAdapterName';
import { HPPClickToPayAdapter } from './hosted-payments-page-click-to-pay-adapter/HPPClickToPayAdapter';

describe('ClickToPayAdapterFactory()', () => {
  let sut: ClickToPayAdapterFactory;

  beforeEach(() => {
    const messageBus: IMessageBus = mock<IMessageBus>();
    const frameQueryingServiceMock: IFrameQueryingService = mock<IFrameQueryingService>();
    const digitalTerminalMock: DigitalTerminal = mock(DigitalTerminal);
    sut = new ClickToPayAdapterFactory(instance(digitalTerminalMock), instance(messageBus), instance(frameQueryingServiceMock));
  });

  describe('create()', () => {
    it('should return instance of adapter class depending on input parameter', () => {
      expect(sut.create(ClickToPayAdapterName.hpp)).toBeInstanceOf(HPPClickToPayAdapter);
    });
  });
});
