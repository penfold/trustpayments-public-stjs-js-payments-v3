import Card from '@securetrading/js-payments-card/stcard';
import { Service } from 'typedi';
import { BrowserLocalStorage } from '../../../shared/services/storage/BrowserLocalStorage';
import { IFormFieldState } from '../../core/models/IFormFieldState';
import { IMessageBus } from '../../core/shared/message-bus/IMessageBus';
import { MessageBus } from '../../core/shared/message-bus/MessageBus';
import { filter } from 'rxjs/operators';

@Service()
export class AnimatedCard {
  private card: Card;

  constructor(private localStorage: BrowserLocalStorage, private messageBus: IMessageBus) {
    this.localStorage
      .select(storage => storage.locale)
      .pipe(filter(Boolean))
      .subscribe(locale => {
        this.card = new Card({
          locale,
          animatedCardContainer: 'st-animated-card',
        });
        this.initSubscribers();
      });
  }

  private initSubscribers(): void {
    this.messageBus.subscribeType(MessageBus.EVENTS.CHANGE_CARD_NUMBER, (data: IFormFieldState) => {
      const { value } = data;
      this.card.onCardNumberChange(value, true);
    });
    this.messageBus.subscribeType(MessageBus.EVENTS.CHANGE_EXPIRATION_DATE, (data: IFormFieldState) => {
      const { value } = data;
      this.card.onExpirationDateChange(value, true);
    });
    this.messageBus.subscribeType(MessageBus.EVENTS.CHANGE_SECURITY_CODE, (data: IFormFieldState) => {
      const { value } = data;
      this.card.onSecurityCodeChange(value, true);
    });
    this.messageBus.subscribeType(MessageBus.EVENTS.FOCUS_SECURITY_CODE, (data: IFormFieldState) => {
      this.card.onFieldFocusOrBlur(data);
    });
    this.messageBus.subscribeType(MessageBus.EVENTS.BLUR_SECURITY_CODE, (data: IFormFieldState) => {
      this.card.onFieldFocusOrBlur(data);
    });
  }
}
