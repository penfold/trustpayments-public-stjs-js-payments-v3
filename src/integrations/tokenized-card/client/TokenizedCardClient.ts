import { Service } from 'typedi';
import { Observable, of } from 'rxjs';
import { first } from 'rxjs/operators';
import { IframeFactory } from '../../../client/iframe-factory/IframeFactory';
import { ITokenizedCardPaymentConfig } from '../models/ITokenizedCardPayment';
import { JwtDecoder } from '../../../shared/services/jwt-decoder/JwtDecoder';
import { IMessageBus } from '../../../application/core/shared/message-bus/IMessageBus';
import { IStore } from '../../../application/core/store/IStore';
import { IApplicationFrameState } from '../../../application/core/store/state/IApplicationFrameState';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { PayButton } from '../../../client/pay-button/PayButton';

import { FormState } from '../../../application/core/models/constants/FormState';
import { ofType } from '../../../shared/services/message-bus/operators/ofType';
import { IMessageBusEvent } from '../../../application/core/models/IMessageBusEvent';
import {
  TOKENIZED_SECURITY_CODE_COMPONENT_NAME,
  TOKENIZED_SECURITY_CODE_IFRAME,
} from '../../../application/core/models/constants/SecurityCodeTokenized';
import { IStJwtPayload } from '../../../application/core/models/IStJwtPayload';
import { MessageBus } from '../../../application/core/shared/message-bus/MessageBus';
import { PayButtonFactory } from '../../../client/pay-button/PayButtonFactory';
import { IStyles } from '../../../shared/model/config/IStyles';
import { IStyle } from '../../../shared/model/config/IStyle';

@Service()
export class TokenizedCardClient {
  private destroy$: Observable<IMessageBusEvent<unknown>>;
  private payButton: PayButton

  constructor(private iframeFactory: IframeFactory,
              private jwtDecoder: JwtDecoder,
              private messageBus: IMessageBus,
              private payButtonFactory: PayButtonFactory,
              private store: IStore<IApplicationFrameState>) {

    this.destroy$ = this.messageBus.pipe(ofType(PUBLIC_EVENTS.DESTROY));
    this.payButton = this.payButtonFactory.create();
  }

  init(config: ITokenizedCardPaymentConfig): Observable<ITokenizedCardPaymentConfig> {
    if(!config) {
      return of(undefined);
    }

    this.insertSecurityCodeFrame(config);
    this.payButton.init(config);
    this.payButton.addClickHandler(this.startPaymentEvent.bind(this));
    this.payButton.disable(FormState.AVAILABLE);
    this.preventFormSubmit(config.formId);
    this.setDisableListener()

    return of(config);
  }

  private setDisableListener(): void {
    this.messageBus.subscribeType(MessageBus.EVENTS_PUBLIC.BLOCK_FORM, (state: FormState) => {
      this.payButton.disable(state);
    });
  }

  private insertSecurityCodeFrame(tokenizedCardConfig: ITokenizedCardPaymentConfig): void {

    if(!tokenizedCardConfig) {
      return;
    }

    const securityCodeSlot: HTMLElement = document.querySelector(`#${tokenizedCardConfig.formId} #${tokenizedCardConfig.securityCodeSlotId}`);
    const store: IApplicationFrameState = this.store.getState();
    const securityCodeIframe = this.iframeFactory.create(
      TOKENIZED_SECURITY_CODE_COMPONENT_NAME,
      TOKENIZED_SECURITY_CODE_IFRAME,
      this.getStyles(store.initialConfig.config.styles) as IStyle,
      {
        locale: this.jwtDecoder.decode<IStJwtPayload>(store.initialConfig.config.jwt).payload.locale || 'en_GB',
        origin: store.initialConfig.config.origin,
      });

    securityCodeSlot.appendChild(securityCodeIframe);
  }

  private getStyles(styles: IStyles): IStyles {
    for(const key in styles){
      if(styles[key] instanceof Object) {
        return styles;
      }
    }
    styles = { defaultStyles: styles as  IStyle };
    return styles;
  }

  private startPaymentEvent(){
    this.messageBus.publish({ type:  PUBLIC_EVENTS.TOKENIZED_CARD_START_PAYMENT_METHOD })
  }

  private preventFormSubmit(formId): void {
    const preventFunction = (event: Event) => event.preventDefault();
    const paymentForm = document.getElementById(formId);

    paymentForm.addEventListener('submit', preventFunction);

    this.destroy$.pipe(first()).subscribe(() => {
      paymentForm.removeEventListener('submit', preventFunction);
    });
  }

}
