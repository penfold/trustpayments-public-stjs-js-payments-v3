import { Service } from 'typedi';
import { Observable, takeUntil } from 'rxjs';
import { MessageSubscriberToken } from '../../../../shared/dependency-injection/InjectionTokens';
import { IMessageSubscriber } from '../../../../shared/services/message-bus/interfaces/IMessageSubscriber';
import { GoogleAnalytics } from '../../integrations/google-analytics/GoogleAnalytics';
import { IMessageBus } from '../../shared/message-bus/IMessageBus';
import { ofType } from '../../../../shared/services/message-bus/operators/ofType';
import { untilDestroy } from '../../../../shared/services/message-bus/operators/untilDestroy';
import { PUBLIC_EVENTS } from '../../models/constants/EventTypes';
import { ofTypeList } from '../../../../shared/services/message-bus/operators/ofTypeList';
import { IMessageBusEvent } from '../../models/IMessageBusEvent';
import { MESSAGES_LIST_FOR_ANALYTICS_SENDER } from './AnalyticsEventSenderConfig';
import { AnalyticsEventSenderConfig } from './AnalyticsEventSenderInterface';

@Service({ id: MessageSubscriberToken, multiple: true })
export class AnalyticsEventSender implements IMessageSubscriber {
  constructor(private googleAnalytics: GoogleAnalytics) {
  }

  register(messageBus: IMessageBus): void {
    const destroy$: Observable<void> = messageBus.pipe(ofType(PUBLIC_EVENTS.DESTROY), untilDestroy(messageBus));
    const eventsToWatch: string[] = Object.keys(MESSAGES_LIST_FOR_ANALYTICS_SENDER);

    messageBus.pipe(
      ofTypeList(eventsToWatch),
      takeUntil(destroy$)
    ).subscribe((event: IMessageBusEvent<any>) => {
      const eventConfig: AnalyticsEventSenderConfig = MESSAGES_LIST_FOR_ANALYTICS_SENDER[event.type];
      this.googleAnalytics.sendGaData('event', event.data.name, eventConfig.gaEventType, eventConfig.message(event?.data?.name));
    });
  }

}
