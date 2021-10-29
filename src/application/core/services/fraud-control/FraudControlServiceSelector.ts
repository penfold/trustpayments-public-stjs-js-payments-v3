import { Observable, of, throwError } from 'rxjs';
import { IFraudControlDataProvider } from './IFraudControlDataProvider';
import { ContainerInstance, Service } from 'typedi';
import { FraudControlDataProviderName } from './FraudControlProviderName.enum';
import { ConfigProvider } from '../../../../shared/services/config-provider/ConfigProvider';
import { mapTo, switchMap } from 'rxjs/operators';
import { Seon } from '../../integrations/seon/Seon';
import { Cybertonica } from '../../integrations/cybertonica/Cybertonica';

@Service()
export class FraudControlServiceSelector {
  private providers: Map<FraudControlDataProviderName, Observable<IFraudControlDataProvider<unknown>>> = new Map();

  constructor(
    private container: ContainerInstance,
    private configProvider: ConfigProvider,
  ) {
  }

  getFraudControlDataProvider(): Observable<IFraudControlDataProvider<unknown>> {
    return this.resolveProviderServiceType().pipe(
      switchMap(serviceType => {
        if (this.providers.has(serviceType)) {
          return this.providers.get(serviceType);
        }

        this.providers.set(serviceType, this.initProviderService(serviceType));

        return this.providers.get(serviceType);
      }),
    )
  }

  private resolveProviderServiceType(): Observable<FraudControlDataProviderName> {
    return of(FraudControlDataProviderName.CYBERTONICA);
  }

  private initProviderService(serviceType: FraudControlDataProviderName): Observable<IFraudControlDataProvider<unknown>> {
    switch (serviceType) {
      case FraudControlDataProviderName.CYBERTONICA: {
        return this.configProvider.getConfig$().pipe(
          switchMap(config => {
            const cybertonica = this.container.get(Cybertonica);

            return cybertonica.init(config.cybertonicaApiKey).pipe(mapTo(cybertonica));
          }),
        );
      }
      case FraudControlDataProviderName.SEON: {
        const seon = this.container.get(Seon);

        return seon.init().pipe(mapTo(seon));
      }
      default: {
        return throwError(() => new Error(`Unknown Fraud Control Service: ${serviceType}`));
      }
    }
  }
}
