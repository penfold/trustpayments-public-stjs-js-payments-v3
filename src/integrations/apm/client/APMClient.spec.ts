import { anything, instance, mock, when } from 'ts-mockito';
import { APMConfigResolver } from '../services/apm-config-resolver/APMConfigResolver';
import { APMClient } from './APMClient';
import { IAPMConfig } from '../models/IAPMConfig';
import { APMName } from '../models/APMName';
import { IMessageBus } from '../../../application/core/shared/message-bus/IMessageBus';
import { DomMethods } from '../../../application/core/shared/dom-methods/DomMethods';
import { IAPMItemConfig } from '../models/IAPMItemConfig';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { APMPaymentMethodName } from '../models/IAPMPaymentMethod';
import { IMessageBusEvent } from '../../../application/core/models/IMessageBusEvent';
import { IStartPaymentMethod } from '../../../application/core/services/payments/events/IStartPaymentMethod';
import { of } from 'rxjs';
import clearAllMocks = jest.clearAllMocks;
import resetAllMocks = jest.resetAllMocks;
import { APMFilterService } from '../services/apm-filter-service/APMFilterService';

describe('APMClient', () => {
  let apmConfigResolver: APMConfigResolver;
  let apmFilterService: APMFilterService;
  const messageBus = {
    publish: jest.fn(),
    pipe: jest.fn().mockRejectedValue(of(null)),
  } as unknown as IMessageBus;
  const testConfig: IAPMConfig = {
    placement: 'test-placement',
    successRedirectUrl: 'successUrl',
    cancelRedirectUrl: 'cancelUrl',
    errorRedirectUrl: 'errorUrl',
    apmList: [
      {
        name: APMName.ZIP,
        placement: 'test-placement',
        successRedirectUrl: 'successUrl',
        cancelRedirectUrl: 'cancelUrl',
        errorRedirectUrl: 'errorUrl',
      },
      {
        name: APMName.ZIP,
        placement: 'test-placement-2',
        successRedirectUrl: 'successUrl',
        cancelRedirectUrl: 'cancelUrl',
        errorRedirectUrl: 'errorUrl',
      },
    ],
  };
  let apmClient: APMClient;

  beforeEach(() => {
    resetAllMocks();
    apmConfigResolver = mock(APMConfigResolver);
    apmFilterService = mock(APMFilterService);
    when(apmConfigResolver.resolve(anything())).thenReturn(testConfig);
    apmClient = new APMClient(instance(apmConfigResolver), messageBus, instance(apmFilterService));
    document.body.innerHTML = '<div id="test-placement"></div><div id="test-placement-2"></div>';
  });

  describe('init()', () => {
    const zipIconEncoded = require('./images/zip.svg');

    it('should generate APM buttons from provided config object and insert each button to its respective container',
      (done) => {
        apmClient.init(testConfig).subscribe(() => {
          expect(document.body.innerHTML.replace(/"/g, '\''))
            .toEqual(`<div id='test-placement'><div class='st-apm-button'><img src='${zipIconEncoded}' alt='${APMName.ZIP}' class='st-apm-button__img'></div></div><div id='test-placement-2'><div class='st-apm-button'><img src='${zipIconEncoded}' alt='${APMName.ZIP}' class='st-apm-button__img'></div></div>`);
          done();
        });
      });

    it('should assign click event listener to inserted buttons, that will publish start payment method message, subscribe to apm redirect method and do a redirect', (done) => {
      jest.spyOn(DomMethods, 'redirect').mockImplementation(() => {
      });
      apmClient.init(testConfig).subscribe(() => {
        document.body.querySelectorAll('div.st-apm-button')
          .forEach((insertedAPMButton, index) => {
            const publishedEvent: IMessageBusEvent<IStartPaymentMethod<IAPMItemConfig>> = {
              type: PUBLIC_EVENTS.START_PAYMENT_METHOD,
              data: {
                data: testConfig.apmList[index] as IAPMItemConfig,
                name: APMPaymentMethodName,
              },
            };
            const testRedirectUrl = (testConfig.apmList[index] as IAPMItemConfig).successRedirectUrl;
            messageBus.pipe = jest.fn().mockReturnValue(of({ data: testRedirectUrl }));

            insertedAPMButton.dispatchEvent(new Event('click'));

            expect(messageBus.publish).toHaveBeenCalledWith(publishedEvent);
            expect(DomMethods.redirect).toHaveBeenCalledWith(testRedirectUrl);
            clearAllMocks();
          });

        done();
      });
    });
  });
});
