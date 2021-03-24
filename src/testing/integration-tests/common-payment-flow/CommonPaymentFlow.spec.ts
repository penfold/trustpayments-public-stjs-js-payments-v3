import { TestPaymentMethod } from './TestPaymentMethod';
import { Container } from 'typedi';
import { PaymentController } from '../../../application/core/services/payments/PaymentController';
import { TestConfigProvider } from '../../mocks/TestConfigProvider';
import { IMessageBus } from '../../../application/core/shared/message-bus/IMessageBus';
import { ConfigProviderToken, MessageBusToken } from '../../../shared/dependency-injection/InjectionTokens';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { IInitPaymentMethod } from '../../../application/core/services/payments/events/IInitPaymentMethod';
import { ITestResultData } from './interfaces/ITestResultData';
import { IConfig } from '../../../shared/model/config/IConfig';
import { IStartPaymentMethod } from '../../../application/core/services/payments/events/IStartPaymentMethod';
import { PaymentStatus } from '../../../application/core/services/payments/PaymentStatus';
import { ofType } from '../../../shared/services/message-bus/operators/ofType';
import { zip } from 'rxjs';
import { first } from 'rxjs/operators';
import { DomMethods } from '../../../application/core/shared/dom-methods/DomMethods';
import { PaymentResultSubmitterSubscriber } from '../../../client/common-frames/PaymentResultSubmitterSubscriber';
import { ITestStartData } from './interfaces/ITestStartData';

describe('Common Payment Flow', () => {
  let paymentController: PaymentController;
  let configProvider: TestConfigProvider;
  let messageBus: IMessageBus;
  let config: IConfig;
  let form: HTMLFormElement;
  let paymentResultSubmitterSubscriber: PaymentResultSubmitterSubscriber;

  beforeAll(() => {
    Container.import([TestPaymentMethod]);
    paymentController = Container.get(PaymentController);
    configProvider = Container.get(ConfigProviderToken) as TestConfigProvider;
    messageBus = Container.get(MessageBusToken);
    paymentResultSubmitterSubscriber = Container.get(PaymentResultSubmitterSubscriber);

    config = {
      formId: 'st-form',
      submitFields: ['baz', 'xyz'],
      submitOnError: true
    };

    document.body.appendChild((form = DomMethods.createHtmlElement({ id: 'st-form' }, 'form') as HTMLFormElement));

    configProvider.setConfig(config);
    paymentResultSubmitterSubscriber.register(messageBus);
    paymentController.init();
  });

  it('runs a test payment method and when finished calls success callback', done => {
    zip(
      messageBus.pipe(ofType(PUBLIC_EVENTS.CALL_MERCHANT_SUBMIT_CALLBACK)),
      messageBus.pipe(ofType(PUBLIC_EVENTS.CALL_MERCHANT_SUCCESS_CALLBACK))
    )
      .pipe(first())
      .subscribe(([submitCallbackEvent, successCallbackEvent]) => {
        const resultData: ITestResultData = {
          baz: 'baz',
          xyz: 'xyz',
          jwt: 'jwt',
          threedresponse: 'threedresponse'
        };

        expect(submitCallbackEvent).toEqual({
          type: PUBLIC_EVENTS.CALL_MERCHANT_SUBMIT_CALLBACK,
          data: resultData
        });

        expect(successCallbackEvent).toEqual({
          type: PUBLIC_EVENTS.CALL_MERCHANT_SUCCESS_CALLBACK,
          data: resultData
        });

        done();
      });

    messageBus.publish<IInitPaymentMethod<IConfig>>({
      type: PUBLIC_EVENTS.INIT_PAYMENT_METHOD,
      data: { name: 'test', config }
    });

    messageBus.publish<IStartPaymentMethod<ITestStartData>>({
      type: PUBLIC_EVENTS.START_PAYMENT_METHOD,
      data: {
        name: 'test',
        data: {
          resultStatus: PaymentStatus.SUCCESS,
          bar: 'bar',
          foo: 'foo'
        }
      }
    });
  });

  it('runs a test payment method and when cancelled calls cancel callback', done => {
    zip(
      messageBus.pipe(ofType(PUBLIC_EVENTS.CALL_MERCHANT_SUBMIT_CALLBACK)),
      messageBus.pipe(ofType(PUBLIC_EVENTS.CALL_MERCHANT_CANCEL_CALLBACK))
    )
      .pipe(first())
      .subscribe(([submitCallbackEvent, cancelCallbackEvent]) => {
        const resultData: ITestResultData = {
          baz: 'baz',
          xyz: 'xyz'
        };

        expect(submitCallbackEvent).toEqual({
          type: PUBLIC_EVENTS.CALL_MERCHANT_SUBMIT_CALLBACK,
          data: resultData
        });

        expect(cancelCallbackEvent).toEqual({
          type: PUBLIC_EVENTS.CALL_MERCHANT_CANCEL_CALLBACK,
          data: resultData
        });

        done();
      });

    messageBus.publish<IInitPaymentMethod<IConfig>>({
      type: PUBLIC_EVENTS.INIT_PAYMENT_METHOD,
      data: { name: 'test', config }
    });

    messageBus.publish<IStartPaymentMethod<ITestStartData>>({
      type: PUBLIC_EVENTS.START_PAYMENT_METHOD,
      data: {
        name: 'test',
        data: {
          resultStatus: PaymentStatus.CANCEL,
          bar: 'bar',
          foo: 'foo'
        }
      }
    });
  });

  it('runs a test payment method and when failed submits the form', done => {
    spyOn(form, 'submit').and.callFake(() => {
      const inputs: HTMLCollection = form.getElementsByTagName('input');
      const formData = Array.from(inputs).reduce((data, input: HTMLInputElement) => {
        const name = input.getAttribute('name');
        return { ...data, [name]: input.value };
      }, {});

      expect(inputs.length).toBe(2);
      expect(formData).toEqual({ baz: 'baz', xyz: 'xyz' });
      done();
    });

    DomMethods.addDataToForm(form, { old: 'value' });

    messageBus.publish<IInitPaymentMethod<IConfig>>({
      type: PUBLIC_EVENTS.INIT_PAYMENT_METHOD,
      data: { name: 'test', config }
    });

    messageBus.publish<IStartPaymentMethod<ITestStartData>>({
      type: PUBLIC_EVENTS.START_PAYMENT_METHOD,
      data: {
        name: 'test',
        data: {
          resultStatus: PaymentStatus.FAILURE,
          bar: 'bar',
          foo: 'foo'
        }
      }
    });
  });
});
