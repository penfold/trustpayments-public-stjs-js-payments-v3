import { BehaviorSubject, Observable } from 'rxjs';
import { Container, Service } from 'typedi';
import { filter, first } from 'rxjs/operators';
import { IConfig } from '../../model/config/IConfig';
import { ConfigResolver } from '../config-resolver/ConfigResolver';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { ConfigProvider } from '../config-provider/ConfigProvider';
import { CONFIG } from '../../dependency-injection/InjectionTokens';
import { JwtDecoder } from '../jwt-decoder/JwtDecoder';
import { IMessageBus } from '../../../application/core/shared/message-bus/IMessageBus';
import { GooglePayConfigName } from '../../../integrations/google-pay/models/IGooglePayConfig';

@Service()
export class ConfigService implements ConfigProvider {
  private config$: BehaviorSubject<IConfig> = new BehaviorSubject(null);
  private configFromJwt: boolean;

  constructor(
    private resolver: ConfigResolver,
    private messageBus: IMessageBus,
    private jwtDecoder: JwtDecoder,
  ) {
  }

  setup(configObj: IConfig): IConfig {
    const { config, configFromJwt } = this.getConfigurationFromConfigOrJwt(configObj);
    this.configFromJwt = configFromJwt;

    return this.updateConfig(config);
  }

  update(configObj: IConfig): IConfig {
    if (this.configFromJwt) {
      this.cannotOverride();
    }

    return this.updateConfig(configObj);
  }

  updateJwt(jwt: string): IConfig {
    return this.updateConfig({ ...this.getConfig(), jwt });
  }

  updateFragment<K extends 'components' | 'visaCheckout' | 'applePay' | typeof GooglePayConfigName,
    C extends IConfig[K]>(key: K, config: C): IConfig {
    if (this.configFromJwt) {
      this.cannotOverride();
    }

    const currentConfig = this.getConfig();
    const currentFragment = currentConfig[key];
    const updatedFragment = { ...currentFragment, ...(config || {}) };
    const updatedConfig = { ...currentConfig, [key]: updatedFragment };

    return this.updateConfig(updatedConfig);
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

  private updateConfig(config: IConfig): IConfig {
    const fullConfig = this.resolver.resolve(config);

    this.config$.next(fullConfig);

    this.messageBus.publish({
      type: PUBLIC_EVENTS.CONFIG_CHANGED,
      data: JSON.parse(JSON.stringify(fullConfig)),
    });

    Container.set(CONFIG, fullConfig);

    return fullConfig;
  }

  private getConfigurationFromConfigOrJwt(config: IConfig): { config: IConfig; configFromJwt: boolean } {
    if (!config) {
      return {
        configFromJwt: false,
        config: { jwt: '' },
      };
    }

    if (!config.jwt) {
      return {
        configFromJwt: false,
        config: { ...config },
      };
    }

    const { payload } = this.jwtDecoder.decode<{ config: IConfig }>(config.jwt);
    if (!payload.config) {
      return {
        configFromJwt: false,
        config,
      };
    }

    const allowedKeys = ['jwt', 'submitCallback', 'successCallback', 'errorCallback', 'cancelCallback'];

    Object.keys(config).forEach(key => allowedKeys.includes(key) || this.cannotOverride());

    return {
      configFromJwt: true,
      config: {
        ...payload.config,
        jwt: config.jwt,
        submitCallback: config.submitCallback,
        successCallback: config.successCallback,
        errorCallback: config.errorCallback,
        cancelCallback: config.cancelCallback,
      },
    };
  }

  private cannotOverride(): void {
    throw new Error(
      'Cannot override the configuration specified in the JWT. ' +
      'The config object should contain only the JWT and callbacks (optionally).',
    );
  }
}
