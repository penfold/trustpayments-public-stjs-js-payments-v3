import { finalize, Observable, of, throwError } from 'rxjs';
import { catchError, map, mapTo, switchMap } from 'rxjs/operators';
import { Inject, Service } from 'typedi';
import { IPaymentMethod } from '../../../application/core/services/payments/IPaymentMethod';
import { IPaymentResult } from '../../../application/core/services/payments/IPaymentResult';
import { PaymentStatus } from '../../../application/core/services/payments/PaymentStatus';
import { IRequestProcessingService } from '../../../application/core/services/request-processor/IRequestProcessingService';
import { RequestProcessingInitializer } from '../../../application/core/services/request-processor/RequestProcessingInitializer';
import { IRequestTypeResponse } from '../../../application/core/services/st-codec/interfaces/IRequestTypeResponse';
import { PaymentMethodToken } from '../../../application/dependency-injection/InjectionTokens';
import { ConfigProvider } from '../../../shared/services/config-provider/ConfigProvider';
import { IMessageBusEvent } from '../../../application/core/models/IMessageBusEvent';
import { PRIVATE_EVENTS, PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { MERCHANT_PARENT_FRAME } from '../../../application/core/models/constants/Selectors';
import { IFrameQueryingService } from '../../../shared/services/message-bus/interfaces/IFrameQueryingService';
import { IConfig } from '../../../shared/model/config/IConfig';
import { TokenizedCardPaymentMethodName } from '../models/ITokenizedCardPaymentMethod';
import { ITokenizedCardPayGatewayRequest, ITokenizedCardPaymentConfig } from '../models/ITokenizedCardPayment';
import { IMessageBus } from '../../../application/core/shared/message-bus/IMessageBus';
import { EventScope } from '../../../application/core/models/constants/EventScope';
import { IFormFieldState } from '../../../application/core/models/IFormFieldState';
import { IStore } from '../../../application/core/store/IStore';
import { IApplicationFrameState } from '../../../application/core/store/state/IApplicationFrameState';
import { MessageBus } from '../../../application/core/shared/message-bus/MessageBus';
import { TransportServiceGatewayClient } from '../../../application/core/services/gateway-client/TransportServiceGatewayClient';
import { IGatewayClient } from '../../../application/core/services/gateway-client/IGatewayClient';
import { TERM_URL } from '../../../application/core/models/constants/RequestData';
import { FormState } from '../../../application/core/models/constants/FormState';

@Service({ id: PaymentMethodToken, multiple: true })
export class TokenizedCardPaymentMethod implements IPaymentMethod<IConfig, ITokenizedCardPayGatewayRequest, IRequestTypeResponse> {
  private requestProcessingService: Observable<IRequestProcessingService>;
  private cvv: IFormFieldState;
  private formId: string;

  constructor(
    @Inject(() => TransportServiceGatewayClient) private gatewayClient: IGatewayClient,
    private requestProcessingInitializer: RequestProcessingInitializer,
    private configProvider: ConfigProvider,
    private frameQueryingService: IFrameQueryingService,
    private messageBus: IMessageBus,
    private store: IStore<IApplicationFrameState>
  ) {
  }

  getName(): string {
    return TokenizedCardPaymentMethodName;
  }

  init(config: ITokenizedCardPaymentConfig): Observable<void> {
    const initClientQueryEvent: IMessageBusEvent = {
      type: PUBLIC_EVENTS.TOKENIZED_CARD_CLIENT_INIT,
      data: config,
    };

    this.formId = config.formId;

    this.initListenerForSecurityCode();
    this.initListenerForPayButtonClick();
    return this.frameQueryingService.query(initClientQueryEvent, MERCHANT_PARENT_FRAME).pipe(mapTo(undefined));

  }

  start(data): Observable<IPaymentResult<IRequestTypeResponse>> {
    this.messageBus.publish({ type: PUBLIC_EVENTS.JWT_REPLACED, data: this.store.getState().tokenizedJwt });
    this.requestProcessingService = this.requestProcessingInitializer.initialize(this.gatewayClient);
    data = {
      ...data,
      formId: this.formId,
      pan: '',
      expirationDate: '',
      termurl: TERM_URL,
    };

    return this.requestProcessingService.pipe(
      switchMap(requestProcessingService => {

        return requestProcessingService.process(data);
      }),
      map(response => this.mapPaymentResponse(response, data)),
      catchError(response => this.handleResponseError(response, data)),
      finalize(()=>{
        this.messageBus.publish({
          type: MessageBus.EVENTS_PUBLIC.BLOCK_FORM,
          data: FormState.AVAILABLE,
        },  EventScope.ALL_FRAMES);
      })
    );
  }

  private handleResponseError(responseOrError, data: ITokenizedCardPayGatewayRequest) {
    if(!responseOrError.requesttypedescription) {
      return throwError(responseOrError);
    }

    return of({
      status: this.resolvePaymentStatus(responseOrError),
      data: responseOrError,
      paymentMethodName: TokenizedCardPaymentMethodName,
    });
  }

  private mapPaymentResponse(
    response: IRequestTypeResponse,
    request: ITokenizedCardPayGatewayRequest
  ): IPaymentResult<IRequestTypeResponse> {
    const mappedResponse: IPaymentResult<IRequestTypeResponse> = {
      status: this.resolvePaymentStatus(response),
      data: response,
      paymentMethodName: TokenizedCardPaymentMethodName,
    };

    if(mappedResponse.status === PaymentStatus.ERROR) {
      mappedResponse.error = {
        code: Number(response.errorcode),
        message: response.errormessage,
      };
    }

    return mappedResponse;
  }

  private resolvePaymentStatus(response: IRequestTypeResponse): PaymentStatus {
    if(Number(response.errorcode) !== 0) {
      return PaymentStatus.ERROR;
    }

    if(response.isCancelled) {
      return PaymentStatus.CANCEL;
    }

    return PaymentStatus.SUCCESS;
  }

  private initListenerForSecurityCode() {
    this.messageBus.subscribeType(PRIVATE_EVENTS.CHANGE_TOKENIZED_SECURITY_CODE, (cvv: IFormFieldState) => {
      this.cvv = cvv;
    });
  }

  private initListenerForPayButtonClick() {
    this.messageBus.subscribeType(PUBLIC_EVENTS.TOKENIZED_CARD_START_PAYMENT_METHOD, () => {
      this.messageBus.publish({
        type: MessageBus.EVENTS.VALIDATE_TOKENIZED_SECURITY_CODE,
      });
      this.startPaymentEvent();
    });
  }

  private startPaymentEvent() {
    if(!this.cvv?.validity) {
      return;
    }

    this.messageBus.publish({
      type: MessageBus.EVENTS_PUBLIC.BLOCK_FORM,
      data: FormState.BLOCKED,
    },  EventScope.ALL_FRAMES);

    this.messageBus.publish({
        type: PUBLIC_EVENTS.START_PAYMENT_METHOD,
        data: {
          name: TokenizedCardPaymentMethodName,
          data: {
            securitycode: this.cvv.value,
          },
        },
      });
  }
}
