import { Observable, of } from 'rxjs';
import { Inject, Service } from 'typedi';
import {
  ThreeDSecureInterface,
  ConfigInterface,
  MethodURLResultInterface,
  BrowserDataInterface,
  ChallengeResultInterface,
  LoggingLevel,
  ChallengeDisplayMode,
  ResultActionCode,
} from '3ds-sdk-js';
import { WINDOW } from '../../../../shared/dependency-injection/InjectionTokens';

@Service()
export class ThreeDSecureProviderMock {
  constructor(
    @Inject(WINDOW) private window: Window,
  ) {}

  getSdk(): ThreeDSecureInterface {
    return {
      init$: this.init$,
      run3DSMethod$: this.run3DSMethod$,
      doChallenge$: this.doChallenge$,
      getBrowserData: this.getBrowserData,
    };
  }

  private init$(): Observable<ConfigInterface | never> {
    return of({
      loggingLevel: LoggingLevel.ALL,
      challengeDisplayMode: ChallengeDisplayMode.POPUP,
    });
  }

  private run3DSMethod$(): Observable<MethodURLResultInterface | never> {
    return of({
      status: ResultActionCode.SUCCESS,
      description: 'Success',
      transactionId: 'mockTransId',
    });
  }

  private doChallenge$(): Observable<ChallengeResultInterface | never> {
    return of({
      status: ResultActionCode.SUCCESS,
      description: 'Success',
      transactionId: 'mockTransId',
    })
  }

  private getBrowserData(): BrowserDataInterface {
    return {
      browserJavaEnabled: this.window.navigator.javaEnabled(),
      browserJavascriptEnabled: true,
      browserLanguage: this.window.navigator.language,
      browserScreenWidth: this.window.screen.width,
      browserScreenHeight: this.window.screen.height,
      browserColorDepth: 24,
      browserUserAgent: this.window.navigator.userAgent,
      browserTZ: new Date().getTimezoneOffset(),
    }
  }
}
