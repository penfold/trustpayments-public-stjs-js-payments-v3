import { instance, mock, verify, when } from 'ts-mockito';
import { PUBLIC_EVENTS } from '../../models/constants/EventTypes';
import { IMessageBus } from '../../shared/message-bus/IMessageBus';
import { SimpleMessageBus } from '../../shared/message-bus/SimpleMessageBus';
import { SentryService } from '../../../../shared/services/sentry/SentryService';
import { SentryBreadcrumbsCategories } from '../../../../shared/services/sentry/SentryBreadcrumbsCategories';
import { PayloadSanitizer } from '../../../../shared/services/sentry/PayloadSanitizer';
import { SentryBreadcrumbsSender } from './SentryBreadcrumbsSender';

describe('register()', () => {
  let eventsMessageSender: SentryBreadcrumbsSender;
  let messageBus: IMessageBus;
  let sentryService: SentryService;
  let payloadSanitizer: PayloadSanitizer

  beforeEach(() => {
    sentryService = mock(SentryService);
    messageBus = new SimpleMessageBus();
    payloadSanitizer = mock(PayloadSanitizer);
    eventsMessageSender = new SentryBreadcrumbsSender(instance(sentryService), instance(payloadSanitizer));
    eventsMessageSender.register(messageBus);
  });

  it('should send "JWT updated" to Sentry breadcrumb', () => {
    const jwt =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2NDQ0MDA2NzcsImlzcyI6ImpzbWFudWFsand0IiwicGF5bG9hZCI6eyJiYXNlYW1vdW50IjoiNjAwMTAiLCJhY2NvdW50dHlwZWRlc2NyaXB0aW9uIjoiRUNPTSIsImN1cnJlbmN5aXNvM2EiOiJHQlAiLCJzaXRlcmVmZXJlbmNlIjoidGVzdF9qc21hbnVhbGNhcmRpbmFsOTE5MjEiLCJyZXF1ZXN0dHlwZWRlc2NyaXB0aW9ucyI6WyJUSFJFRURRVUVSWSIsIkFVVEgiXX19.ur6NzW_pTvUrVXvmOPYRMavDRDAIN5Hb4SRH5xccsgQ';
    when(payloadSanitizer.maskSensitiveJwtFields(jwt)).thenReturn({
      iat: 1644400677,
      iss: '***',
      payload: {
        baseamount: '60010',
        accounttypedescription: 'ECOM',
        currencyiso3a: 'GBP',
        sitereference: 'test_jsmanualcardinal91921',
      },
    });
    messageBus.publish({
      type: PUBLIC_EVENTS.UPDATE_JWT,
      data: {
        newJwt: jwt,
      },
    });
    verify(sentryService.addBreadcrumb(SentryBreadcrumbsCategories.JWT_UPDATES, '{"iat":1644400677,"iss":"***","payload":{"baseamount":"60010","accounttypedescription":"ECOM","currencyiso3a":"GBP","sitereference":"test_jsmanualcardinal91921"}}')).once();
  });

  it('should send "Processing screen hidden" to Sentry breadcrumb', () => {
    messageBus.publish({
      type: PUBLIC_EVENTS.THREE_D_SECURE_PROCESSING_SCREEN_HIDE,
    });
    verify(sentryService.addBreadcrumb(SentryBreadcrumbsCategories.THREE_DS, 'Processing screen hidden')).once();
  });

  it('should send "Processing screen shown" to Sentry breadcrumb', () => {
    messageBus.publish({
      type: PUBLIC_EVENTS.THREE_D_SECURE_PROCESSING_SCREEN_SHOW,
    });
    verify(sentryService.addBreadcrumb(SentryBreadcrumbsCategories.THREE_DS, 'Processing screen shown')).once();
  });

  it('should send init event to Sentry breadcrumb', () => {
    messageBus.publish({
      type: PUBLIC_EVENTS.PAYMENT_METHOD_INIT_STARTED,
      data: {
        name: 'GooglePay',
      },
    });
    verify(sentryService.addBreadcrumb(SentryBreadcrumbsCategories.EXPOSED_EVENTS, 'Payment method GooglePay init started')).once();
  });

  it('should send init completed event to Sentry breadcrumb', () => {
    messageBus.publish({
      type: PUBLIC_EVENTS.PAYMENT_METHOD_INIT_COMPLETED,
      data: {
        name: 'GooglePay',
      },
    });
    verify(sentryService.addBreadcrumb(SentryBreadcrumbsCategories.EXPOSED_EVENTS, 'Payment method GooglePay init completed')).once();
  });

  it('should send init failed event to Sentry breadcrumb', () => {
    messageBus.publish({
      type: PUBLIC_EVENTS.PAYMENT_METHOD_INIT_FAILED,
      data: {
        name: 'GooglePay',
      },
    });
    verify(sentryService.addBreadcrumb(SentryBreadcrumbsCategories.EXPOSED_EVENTS, 'Payment method GooglePay init failed')).once();
  });

  it('should send payment started event to Sentry breadcrumb', () => {
    messageBus.publish({
      type: PUBLIC_EVENTS.PAYMENT_METHOD_STARTED,
      data: {
        name: 'GooglePay',
      },
    });
    verify(sentryService.addBreadcrumb(SentryBreadcrumbsCategories.EXPOSED_EVENTS, 'Payment by GooglePay started')).once();
  });

  it('should send payment completed event to Sentry breadcrumb', () => {
    messageBus.publish({
      type: PUBLIC_EVENTS.PAYMENT_METHOD_COMPLETED,
      data: {
        name: 'GooglePay',
      },
    });
    verify(sentryService.addBreadcrumb(SentryBreadcrumbsCategories.EXPOSED_EVENTS, 'Payment by GooglePay completed')).once();
  });

  it('should send payment failed event to Sentry breadcrumb', () => {
    messageBus.publish({
      type: PUBLIC_EVENTS.PAYMENT_METHOD_FAILED,
      data: {
        name: 'GooglePay',
      },
    });
    verify(sentryService.addBreadcrumb(SentryBreadcrumbsCategories.EXPOSED_EVENTS, 'Payment by GooglePay failed')).once();
  });

  it('should send payment canceled event to Sentry breadcrumb', () => {
    messageBus.publish({
      type: PUBLIC_EVENTS.PAYMENT_METHOD_CANCELED,
      data: {
        name: 'GooglePay',
      },
    });
    verify(sentryService.addBreadcrumb(SentryBreadcrumbsCategories.EXPOSED_EVENTS, 'Payment by GooglePay canceled')).once();
  });
});
