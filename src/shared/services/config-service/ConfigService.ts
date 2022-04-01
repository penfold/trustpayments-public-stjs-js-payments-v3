import { BehaviorSubject, Observable } from 'rxjs';
import { Container, Service } from 'typedi';
import { filter, first } from 'rxjs/operators';
import { IConfig } from '../../model/config/IConfig';
import { ConfigResolver } from '../config-resolver/ConfigResolver';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { ConfigProvider } from '../config-provider/ConfigProvider';
import { CONFIG } from '../../dependency-injection/InjectionTokens';
import { IMessageBus } from '../../../application/core/shared/message-bus/IMessageBus';
import { GooglePayConfigName } from '../../../integrations/google-pay/models/IGooglePayConfig';
import { TokenizedCardPaymentConfigName } from '../../../integrations/tokenized-card/models/ITokenizedCardPaymentMethod';

@Service()
export class ConfigService implements ConfigProvider {
  private config$: BehaviorSubject<IConfig> = new BehaviorSubject(null);

  constructor(
    private resolver: ConfigResolver,
    private messageBus: IMessageBus,
  ) {
  }

  setup(config: IConfig): IConfig {
    return this.broadcast(this.resolveAndValidate(config));
  }

  updateProp<T extends keyof IConfig>(key: T, value: IConfig[T]): IConfig {
    return this.broadcast(this.resolveAndValidate({ ...this.getConfig(), [key]: value }));
  }

  updateFragment<K extends 'components' | 'visaCheckout' | 'applePay' | typeof GooglePayConfigName | typeof TokenizedCardPaymentConfigName,
    C extends IConfig[K]>(key: K, config: C): IConfig {

    const currentConfig = this.getConfig();
    const currentFragment = currentConfig[key];
    const updatedFragment = { ...currentFragment, ...(config || {}) };
    const updatedConfig = { ...currentConfig, [key]: updatedFragment };

    return this.broadcast(this.resolveAndValidate(updatedConfig));
  }

  getConfig(): IConfig {
    return this.config$.getValue();
  }

  getConfig$(watchForChanges?: boolean): Observable<IConfig> {
    if (watchForChanges) {
      return this.config$.pipe(filter<IConfig>(Boolean));
    }

    return this.config$.pipe(filter<IConfig>(Boolean), first());
  }

  private resolveAndValidate(config: IConfig): IConfig {
    return this.resolver.resolve(config);
  }

  private broadcast(config: IConfig): IConfig {
    this.config$.next(config);

    this.messageBus.publish({
      type: PUBLIC_EVENTS.CONFIG_CHANGED,
      data: JSON.parse(JSON.stringify(config)),
    });

    Container.set(CONFIG, config);

    return config;
  }
}
