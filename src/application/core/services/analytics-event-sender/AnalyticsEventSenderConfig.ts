import { PUBLIC_EVENTS } from '../../models/constants/EventTypes';
import { GAEventType } from '../../integrations/google-analytics/events';
import { AnalyticsEventSenderConfig } from './AnalyticsEventSenderInterface';

export const MESSAGES_LIST_FOR_ANALYTICS_SENDER: Record<string, AnalyticsEventSenderConfig> = {
  [ PUBLIC_EVENTS.PAYMENT_METHOD_INIT_STARTED]: {
    gaEventType: GAEventType.INIT,
    message: (name: string)=>`Payment method ${name} init started`,
  },
  [ PUBLIC_EVENTS.PAYMENT_METHOD_INIT_COMPLETED]: {
    gaEventType: GAEventType.INIT,
    message: (name: string)=>`Payment method ${name} init completed`,
  },
  [ PUBLIC_EVENTS.PAYMENT_METHOD_INIT_FAILED]: {
    gaEventType: GAEventType.INIT,
    message: (name: string)=>`Payment method ${name} init failed`,
  },
  [ PUBLIC_EVENTS.PAYMENT_METHOD_STARTED]: {
    gaEventType: GAEventType.PAYMENT,
    message: (name: string)=>`Payment by ${name} started`,
  },
  [ PUBLIC_EVENTS.PAYMENT_METHOD_FAILED]: {
    gaEventType: GAEventType.PAYMENT,
    message: (name: string)=>`Payment by ${name} failed`,
  },
  [ PUBLIC_EVENTS.PAYMENT_METHOD_CANCELED]: {
    gaEventType: GAEventType.PAYMENT,
    message: (name: string)=>`Payment by ${name} canceled`,
  },
  [ PUBLIC_EVENTS.PAYMENT_METHOD_COMPLETED]: {
    gaEventType: GAEventType.PAYMENT,
    message: (name: string)=>`Payment by ${name} completed`,
  },
}

