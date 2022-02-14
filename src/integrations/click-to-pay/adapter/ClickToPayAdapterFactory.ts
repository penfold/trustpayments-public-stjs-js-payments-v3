import { Service } from 'typedi';
import { DigitalTerminal } from '../digital-terminal/DigitalTerminal';
import { IMessageBus } from '../../../application/core/shared/message-bus/IMessageBus';
import { IFrameQueryingService } from '../../../shared/services/message-bus/interfaces/IFrameQueryingService';
import { HPPClickToPayAdapter } from './hosted-payments-page-click-to-pay-adapter/HPPClickToPayAdapter';
import { ClickToPayAdapterName } from './ClickToPayAdapterName';

@Service()
export class ClickToPayAdapterFactory {
  constructor(private digitalTerminal: DigitalTerminal, private messageBus: IMessageBus, private frameQueryingService: IFrameQueryingService) {
  }

  create(adapter: ClickToPayAdapterName) {
    if (adapter === ClickToPayAdapterName.hpp) {
      return new HPPClickToPayAdapter(this.digitalTerminal, this.messageBus, this.frameQueryingService);
    }
  }
}
