import { Service } from 'typedi';
import { DigitalTerminal } from '../digital-terminal/DigitalTerminal';
import { IMessageBus } from '../../../application/core/shared/message-bus/IMessageBus';
import { IFrameQueryingService } from '../../../shared/services/message-bus/interfaces/IFrameQueryingService';
import { CardListGenerator } from '../card-list/CardListGenerator';
import { ClickToPayAdapterName } from './ClickToPayAdapterName';
import { HPPClickToPayAdapter } from './hpp-adapter/HPPClickToPayAdapter';

@Service()
export class ClickToPayAdapterFactory {
  constructor(
    private digitalTerminal: DigitalTerminal,
    private messageBus: IMessageBus,
    private frameQueryingService: IFrameQueryingService,
    private cardListGenerator: CardListGenerator
  ) {
  }

  create(adapter: ClickToPayAdapterName) {
    if (adapter === ClickToPayAdapterName.hpp) {
      return new HPPClickToPayAdapter(
        this.digitalTerminal,
        this.messageBus,
        this.frameQueryingService,
        this.cardListGenerator
      );
    }
  }
}
