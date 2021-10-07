import { anything, instance, mock, when } from 'ts-mockito';
import { APMConfigResolver } from '../services/apm-config-resolver/APMConfigResolver';
import { APMClient } from './APMClient';
import { IAPMConfig } from '../models/IAPMConfig';
import { APMName } from '../models/APMName';
import { IAPMItemConfig } from '../models/IAPMItemConfig';
import { IMessageBus } from '../../../application/core/shared/message-bus/IMessageBus';
import { SimpleMessageBus } from '../../../application/core/shared/message-bus/SimpleMessageBus';

describe('APMClient', () => {
  let apmConfigResolver: APMConfigResolver;
  let messageBus: IMessageBus;
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
    apmConfigResolver = mock(APMConfigResolver);
    messageBus = new SimpleMessageBus();
    when(apmConfigResolver.resolve(anything())).thenReturn(testConfig);
    apmClient = new APMClient(instance(apmConfigResolver), messageBus);
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

    it('should assign click event listener to inserted buttons', (done) => {
      apmClient.init(testConfig).subscribe(() => {
        jest.spyOn(console, 'log');
        document.body.querySelectorAll('div.st-apm-button').forEach((button, index) => {
          button.dispatchEvent(new Event('click'));
          // TODO this is temporary assertion, change it when APMClient is updated
          expect(console.log).toHaveBeenCalledWith(`Payment method initialized: ${(testConfig.apmList[index] as IAPMItemConfig).name}. Payment button clicked`);
        });
        done();
      });
    });
  });
});
