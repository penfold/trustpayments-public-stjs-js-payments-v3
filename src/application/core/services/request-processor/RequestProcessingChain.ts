import { Observable, of, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { TransportService } from '../st-transport/TransportService';
import { IStRequest } from '../../models/IStRequest';
import { IRequestTypeResponse } from '../st-codec/interfaces/IRequestTypeResponse';
import { IRequestProcessor } from './IRequestProcessor';
import { IResponseProcessor } from './IResponseProcessor';
import { IRequestProcessingOptions } from './IRequestProcessingOptions';
import { IErrorHandler } from './IErrorHandler';

export class RequestProcessingChain {
  constructor(
    private requestProcessors: IRequestProcessor[],
    private responseProcessors: IResponseProcessor[],
    private transportService: TransportService,
    private errorHandler?: IErrorHandler,
  ) {
  }

  process(requestData: IStRequest, options: IRequestProcessingOptions): Observable<IRequestTypeResponse> {
    return of(requestData).pipe(
      switchMap(data => this.processRequest(data, this.requestProcessors, options)),
      switchMap(requestData => this.transportService.sendRequest(requestData, options.merchantUrl).pipe(
        switchMap(response => this.processResponse(response, requestData, this.responseProcessors, options)),
      )),
      catchError(error => {
        if (!this.errorHandler) {
          return throwError(() => error);
        }

        return this.errorHandler.handle(error, requestData, options);
      }),
    );
  }

  private processRequest(
    requestData: IStRequest,
    processors: IRequestProcessor[],
    options: IRequestProcessingOptions,
  ): Observable<IStRequest> {
    return processors.reduce((reduced, processor) => {
      return reduced.pipe(switchMap(currentData => processor.process(currentData, options)));
    }, of(requestData));
  }

  private processResponse(
    initialResponse: IRequestTypeResponse,
    requestData: IStRequest,
    processors: IResponseProcessor[],
    options: IRequestProcessingOptions,
  ): Observable<IRequestTypeResponse> {
    return processors.reduce((reduced, processor) => {
      return reduced.pipe(switchMap(currentResponse => processor.process(currentResponse, requestData, options)));
    }, of(initialResponse));
  }
}
