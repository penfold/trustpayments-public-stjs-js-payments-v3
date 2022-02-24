import { PUBLIC_EVENTS } from '../../models/constants/EventTypes';
import { SentryBreadcrumbsCategories } from '../../../../shared/services/sentry/SentryBreadcrumbsCategories';
import { SentryBreadcrumbsSenderConfig } from './SentryBreadcrumbsSenderInterface';

export const MESSAGES_LIST_FOR_SENTRY_BREADCRUMBS_SENDER: Record<string, SentryBreadcrumbsSenderConfig> = {
  [PUBLIC_EVENTS.GATEWAY_REQUEST_SEND]: {
    message: (customMessage: string)=> customMessage,
    sentryBreadcrumbsCategories: SentryBreadcrumbsCategories.GATEWAY_REQUEST,
  },
  [PUBLIC_EVENTS.GATEWAY_RESPONSE_RECEIVED]: {
    message: (customMessage: string)=> customMessage,
    sentryBreadcrumbsCategories: SentryBreadcrumbsCategories.GATEWAY_RESPONSE,
  },
  [PUBLIC_EVENTS.UPDATE_JWT]: {
    message: ()=>'JWT updated',
    sentryBreadcrumbsCategories: SentryBreadcrumbsCategories.JWT_UPDATES,
  },
  [PUBLIC_EVENTS.THREE_D_SECURE_PROCESSING_SCREEN_HIDE]: {
    message: ()=>'Processing screen hidden',
    sentryBreadcrumbsCategories: SentryBreadcrumbsCategories.THREE_DS,
  },
  [ PUBLIC_EVENTS.THREE_D_SECURE_PROCESSING_SCREEN_SHOW]: {
    message: ()=> 'Processing screen shown',
    sentryBreadcrumbsCategories: SentryBreadcrumbsCategories.THREE_DS,
  },
  [ PUBLIC_EVENTS.PAYMENT_METHOD_INIT_STARTED]: {
    message: (name: string)=>`Payment method ${name} init started`,
    sentryBreadcrumbsCategories: SentryBreadcrumbsCategories.EXPOSED_EVENTS,
  },
  [ PUBLIC_EVENTS.PAYMENT_METHOD_INIT_COMPLETED]: {
    message: (name: string)=>`Payment method ${name} init completed`,
    sentryBreadcrumbsCategories: SentryBreadcrumbsCategories.EXPOSED_EVENTS,
  },
  [ PUBLIC_EVENTS.PAYMENT_METHOD_INIT_FAILED]: {
    message: (name: string)=>`Payment method ${name} init failed`,
    sentryBreadcrumbsCategories: SentryBreadcrumbsCategories.EXPOSED_EVENTS,
  },
  [ PUBLIC_EVENTS.PAYMENT_METHOD_STARTED]: {
    message: (name: string)=>`Payment by ${name} started`,
    sentryBreadcrumbsCategories: SentryBreadcrumbsCategories.EXPOSED_EVENTS,
  },
  [ PUBLIC_EVENTS.PAYMENT_METHOD_FAILED]: {
    message: (name: string)=>`Payment by ${name} failed`,
    sentryBreadcrumbsCategories: SentryBreadcrumbsCategories.EXPOSED_EVENTS,
  },
  [ PUBLIC_EVENTS.PAYMENT_METHOD_CANCELED]: {
    message: (name: string)=>`Payment by ${name} canceled`,
    sentryBreadcrumbsCategories: SentryBreadcrumbsCategories.EXPOSED_EVENTS,
  },
  [ PUBLIC_EVENTS.PAYMENT_METHOD_COMPLETED]: {
    message: (name: string)=>`Payment by ${name} completed`,
    sentryBreadcrumbsCategories: SentryBreadcrumbsCategories.EXPOSED_EVENTS,
  },
}

