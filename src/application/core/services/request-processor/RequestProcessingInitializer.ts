import { Service } from 'typedi';
import { Observable } from 'rxjs';
import { IRequestProcessingService } from './IRequestProcessingService';
import { JsInitResponseService } from '../three-d-verification/JsInitResponseService';
import { RequestProcessingServiceProvider } from './RequestProcessingServiceProvider';
import { mapTo, switchMap } from 'rxjs/operators';
import { RemainingRequestTypesProvider } from '../three-d-verification/RemainingRequestTypesProvider';
import { RequestType } from '../../../../shared/types/RequestType';

@Service()
export class RequestProcessingInitializer {
  constructor(
    private jsInitResponseService: JsInitResponseService,
    private requestProcessingServiceProvider: RequestProcessingServiceProvider,
    private remainingRequestTypesProvider: RemainingRequestTypesProvider,
  ) {}

  initialize(): Observable<IRequestProcessingService> {
    return this.remainingRequestTypesProvider.getRemainingRequestTypes().pipe(
      switchMap(requestTypes => {
        if (!requestTypes.includes(RequestType.THREEDQUERY)) {
          return this.initProcessingServiceWithout3D();
        }

        return this.initProcessingService(requestTypes);
      }),
    );
  }

  private initProcessingService(requestTypes: RequestType[]): Observable<IRequestProcessingService> {
    return this.jsInitResponseService.getJsInitResponse().pipe(
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
