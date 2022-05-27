import { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Service } from 'typedi';
import { MessageSubscriberToken } from '../../../../shared/dependency-injection/InjectionTokens';
import { IMessageSubscriber } from '../../../../shared/services/message-bus/interfaces/IMessageSubscriber';
import { ofType } from '../../../../shared/services/message-bus/operators/ofType';
import { PUBLIC_EVENTS } from '../../models/constants/EventTypes';
import { IMessageBusEvent } from '../../models/IMessageBusEvent';
import { IMessageBus } from '../../shared/message-bus/IMessageBus';
import { SentryService } from '../../../../shared/services/sentry/SentryService';
import { ofTypeList } from '../../../../shared/services/message-bus/operators/ofTypeList';
import { untilDestroy } from '../../../../shared/services/message-bus/operators/untilDestroy';
import { PayloadSanitizer } from '../../../../shared/services/sentry/PayloadSanitizer/PayloadSanitizer';
import { SentryBreadcrumbsCategories } from '../../../../shared/services/sentry/constants/SentryBreadcrumbsCategories';
import { MESSAGES_LIST_FOR_SENTRY_BREADCRUMBS_SENDER } from './SentryBreadcrumbsSenderConfig';
import { SentryBreadcrumbsMessageBusData, SentryBreadcrumbsSenderConfig } from './SentryBreadcrumbsSenderInterface';

@Service({ id: MessageSubscriberToken, multiple: true })
export class SentryBreadcrumbsSender implements IMessageSubscriber {
  constructor(private sentryService: SentryService, private payloadSanitizer: PayloadSanitizer) {
  }

  register(messageBus: IMessageBus): void {
    const destroy$: Observable<void> = messageBus.pipe(ofType(PUBLIC_EVENTS.DESTROY), untilDestroy(messageBus));
    const eventsToWatch: string[] = Object.keys(MESSAGES_LIST_FOR_SENTRY_BREADCRUMBS_SENDER);

    messageBus.pipe(
      ofTypeList(eventsToWatch),
      takeUntil(destroy$)
    ).subscribe((event: IMessageBusEvent<SentryBreadcrumbsMessageBusData>) => {
      const eventConfig: SentryBreadcrumbsSenderConfig = MESSAGES_LIST_FOR_SENTRY_BREADCRUMBS_SENDER[event.type];
      if (event?.type === PUBLIC_EVENTS.UPDATE_JWT) {
        const maskedJwt = this.payloadSanitizer.maskSensitiveJwtFields(event?.data?.newJwt);
        this.sentryService.addBreadcrumb(SentryBreadcrumbsCategories.JWT_UPDATES, JSON.stringify(maskedJwt));
      } else {
        this.sentryService.addBreadcrumb(eventConfig.sentryBreadcrumbsCategories, eventConfig.message(event?.data?.name || event?.data?.customMessage));
      }
    });
  }
}
