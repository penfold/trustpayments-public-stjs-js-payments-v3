import { Service } from 'typedi';
import { ConfigProvider } from '../../shared/services/config-provider/ConfigProvider';
import { ITranslator } from '../../application/core/shared/translator/ITranslator';
import { IMessageBus } from '../../application/core/shared/message-bus/IMessageBus';
import { PayButton } from './PayButton';

@Service()
export class PayButtonFactory {
  constructor(
    private configProvider: ConfigProvider,
    private translator: ITranslator,
    private messageBus: IMessageBus,
  ) {
  }

  create(){
    return new PayButton(this.configProvider, this.translator, this.messageBus);
  }
}
