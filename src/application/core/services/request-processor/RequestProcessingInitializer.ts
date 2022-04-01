import { Service } from 'typedi';
import { Observable } from 'rxjs';
import { first, mapTo, switchMap } from 'rxjs/operators';
import { JsInitResponseService } from '../three-d-verification/JsInitResponseService';
import { RemainingRequestTypesProvider } from '../three-d-verification/RemainingRequestTypesProvider';
import { RequestType } from '../../../../shared/types/RequestType';
import { IGatewayClient } from '../gateway-client/IGatewayClient';
import { RequestProcessingServiceProvider } from './RequestProcessingServiceProvider';
import { IRequestProcessingService } from './IRequestProcessingService';

@Service()
export class RequestProcessingInitializer {
  constructor(
    private jsInitResponseService: JsInitResponseService,
    private requestProcessingServiceProvider: RequestProcessingServiceProvider,
    private remainingRequestTypesProvider: RemainingRequestTypesProvider,
  ) {}

  initialize(gatewayClient?: IGatewayClient): Observable<IRequestProcessingService> {
    return this.remainingRequestTypesProvider.getRemainingRequestTypes().pipe(
      switchMap(requestTypes => {
        if (!requestTypes.includes(RequestType.THREEDQUERY)) {
          return this.initProcessingServiceWithout3D();
        }

        return this.initProcessingService(requestTypes, gatewayClient);
      }),
      first(),
    );
  }

  private initProcessingService(requestTypes: RequestType[], gatewayClient?: IGatewayClient): Observable<IRequestProcessingService> {
    return this.jsInitResponseService.getJsInitResponse(gatewayClient).pipe(
      switchMap(jsInitResponse => {
        const requestProcessingService = this.requestProcessingServiceProvider.getRequestProcessingService(
          requestTypes,
          jsInitResponse,
        );

        return requestProcessingService
          .init(jsInitResponse)
          .pipe(mapTo(requestProcessingService));
      }),
    );
  }

  private initProcessingServiceWithout3D(): Observable<IRequestProcessingService> {
    const requestProcessingService = this.requestProcessingServiceProvider.getRequestProcessingServiceWithout3D();

    return requestProcessingService
      .init(null)
      .pipe(mapTo(requestProcessingService));
  }
}
