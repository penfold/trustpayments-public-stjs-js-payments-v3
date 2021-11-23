import { Observable, throwError } from 'rxjs';
import { ContainerInstance, Service } from 'typedi';
import { map, mapTo, switchMap } from 'rxjs/operators';
import { SeonFraudControlDataProvider } from '../../integrations/seon/SeonFraudControlDataProvider';
import { Cybertonica } from '../../integrations/cybertonica/Cybertonica';
import { JwtProvider } from '../../../../shared/services/jwt-provider/JwtProvider';
import { FraudControlDataProviderName } from './FraudControlProviderName.enum';
import { IFraudControlDataProvider } from './IFraudControlDataProvider';
import { DisabledFraudControlDataProvider } from './DisabledFraudControlDataProvider';

type ProviderType = typeof Cybertonica
  | typeof SeonFraudControlDataProvider
  | typeof DisabledFraudControlDataProvider;

@Service()
export class FraudControlServiceSelector {
  private static readonly DEFAULT_SERVICE = FraudControlDataProviderName.SEON;
  private providers: Map<FraudControlDataProviderName, Observable<IFraudControlDataProvider>> = new Map();
  private providerTypes: Record<FraudControlDataProviderName, ProviderType> = {
    [FraudControlDataProviderName.CYBERTONICA]: Cybertonica,
    [FraudControlDataProviderName.DISABLED]: DisabledFraudControlDataProvider,
    [FraudControlDataProviderName.SEON]: SeonFraudControlDataProvider,
  };

  constructor(
    private container: ContainerInstance,
    private jwtProvider: JwtProvider,
  ) {
  }

  getFraudControlDataProvider(): Observable<IFraudControlDataProvider> {
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
    return this.jwtProvider.getJwtPayload().pipe(
      map(payload => payload.fraudcontroltransactionid ?
        FraudControlDataProviderName.DISABLED :
        FraudControlServiceSelector.DEFAULT_SERVICE
      ),
    );
  }

  private initProviderService(serviceType: FraudControlDataProviderName): Observable<IFraudControlDataProvider> {
    if (!this.providerTypes[serviceType]) {
      return throwError(() => new Error(`Unknown Fraud Control Service: ${serviceType}`));
    }

    const providerService: IFraudControlDataProvider = this.container.get<IFraudControlDataProvider>(this.providerTypes[serviceType]);

    return providerService.init().pipe(mapTo(providerService));
  }
}
