import { Service } from 'typedi';
import { takeUntil } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { FormState } from '../../application/core/models/constants/FormState';
import { ConfigProvider } from '../../shared/services/config-provider/ConfigProvider';
import { IConfig } from '../../shared/model/config/IConfig';
import { PAY } from '../../application/core/models/constants/Translations';
import { ofType } from '../../shared/services/message-bus/operators/ofType';
import { PUBLIC_EVENTS } from '../../application/core/models/constants/EventTypes';
import { IMessageBus } from '../../application/core/shared/message-bus/IMessageBus';
import { ITranslator } from '../../application/core/shared/translator/ITranslator';
import { ITokenizedCardPaymentConfig } from '../../integrations/tokenized-card/models/ITokenizedCardPayment';

@Service()
export class PayButton {
  private button: HTMLButtonElement | HTMLInputElement;
  private buttonId: string;
  private destroy$: Observable<void>;

  constructor(
    private configProvider: ConfigProvider,
    private translator: ITranslator,
    private messageBus: IMessageBus,
  ) {
  }

  init(tokenizedCardPaymentConfig?: ITokenizedCardPaymentConfig): void {
    this.destroy$ = this.messageBus.pipe(ofType(PUBLIC_EVENTS.DESTROY));
    this.configProvider.getConfig$().subscribe((config: IConfig) => {
      const components = config.components
      const { buttonId, formId } =  tokenizedCardPaymentConfig? tokenizedCardPaymentConfig: config
      const form = document.getElementById(formId);
      this.buttonId = buttonId;

      this.button = (document.getElementById(this.buttonId) as HTMLInputElement | HTMLButtonElement) ||
        form.querySelector('button[type="submit"]') ||
        form.querySelector('input[type="submit"]');

      if (!this.button) {
        return;
      }

      this.button.textContent = this.translator.translate(PAY);
      this.disable(FormState.LOADING);

      if (components.startOnLoad) {
        this.disable(FormState.AVAILABLE);
      }
    });

    this.messageBus
      .pipe(ofType(PUBLIC_EVENTS.UNLOCK_BUTTON), takeUntil(this.destroy$))
      .subscribe(() => this.disable(FormState.AVAILABLE));

    this.messageBus
      .pipe(ofType(PUBLIC_EVENTS.LOCALE_CHANGED), takeUntil(this.messageBus.pipe(ofType(PUBLIC_EVENTS.DESTROY))))
      .subscribe(() => {
        if (this.button) {
          this.button.textContent = this.translator.translate(PAY);
        }
      });
  }

  disable(state: FormState): void {
    if (this.button) {
      this.button.disabled = true;
      this.button.classList.add('st-button-submit__disabled');
      this.button.textContent = this.translator.translate(PAY);

      if (state === FormState.AVAILABLE) {
        this.button.classList.remove('st-button-submit__disabled');
        this.button.removeAttribute('disabled');
        return;
      }
    }
  }

  addClickHandler(handler: (event) => void): void {
    if (this.button) {
      this.button.addEventListener('click', handler);
    }
  }

  removeClickHandler(handler: (event) => void): void {
    if (this.button) {
      this.button.removeEventListener('click', handler);
    }
  }
}
