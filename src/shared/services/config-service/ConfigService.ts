import { Container, Service } from 'typedi';
import { IConfig } from '../../model/config/IConfig';
import { ConfigResolver } from '../config-resolver/ConfigResolver';
import { ConfigValidator } from '../config-validator/ConfigValidator';
import { MessageBus } from '../../../application/core/shared/message-bus/MessageBus';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { BehaviorSubject, Observable } from 'rxjs';
import { ConfigProvider } from '../config-provider/ConfigProvider';
import { filter, first } from 'rxjs/operators';
import { CONFIG } from '../../dependency-injection/InjectionTokens';
import { JwtDecoder } from '../jwt-decoder/JwtDecoder';

@Service()
export class ConfigService implements ConfigProvider {
  private config$: BehaviorSubject<IConfig> = new BehaviorSubject(null);
  private configFromJwt: boolean;

  constructor(
    private resolver: ConfigResolver,
    private validator: ConfigValidator,
    private messageBus: MessageBus,
    private jwtDecoder: JwtDecoder
  ) {}

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

  updateFragment<K extends 'components' | 'visaCheckout' | 'applePay', C extends IConfig[K]>(
    key: K,
    config: C
  ): IConfig {
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
    const validationError = this.validator.validate(fullConfig);

    if (validationError) {
      throw validationError;
    }

    this.config$.next(fullConfig);

    this.messageBus.publish({
      type: PUBLIC_EVENTS.CONFIG_CHANGED,
      data: JSON.parse(JSON.stringify(fullConfig))
    });

    Container.set(CONFIG, fullConfig);

    return fullConfig;
  }

  private getConfigurationFromConfigOrJwt(config: IConfig): { config: IConfig; configFromJwt: boolean } {
    const { payload } = this.jwtDecoder.decode(config.jwt);

    if (!payload.config) {
      return {
        configFromJwt: false,
        config
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
        cancelCallback: config.cancelCallback
      }
    };
  }

  private cannotOverride(): void {
    throw new Error(
      'Cannot override the configuration specified in the JWT. ' +
        'The config object should contain only the JWT and callbacks (optionally).'
    );
  }
}
