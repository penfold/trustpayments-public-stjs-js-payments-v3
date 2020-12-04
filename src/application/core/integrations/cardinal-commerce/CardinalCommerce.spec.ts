import { MessageBus } from '../../shared/message-bus/MessageBus';
import { NotificationService } from '../../../../client/notification/NotificationService';
import { FramesHub } from '../../../../shared/services/message-bus/FramesHub';
import { CardinalCommerceTokensProvider } from './CardinalCommerceTokensProvider';
import { StTransport } from '../../services/st-transport/StTransport.class';
import { CardinalProvider } from './CardinalProvider';
import { deepEqual, instance, mock, when } from 'ts-mockito';
import { CardinalCommerce } from './CardinalCommerce';
import { ICardinalCommerceTokens } from './ICardinalCommerceTokens';
import { of } from 'rxjs';
import { ICardinal, IContinueObject, IOrderObject } from './ICardinal';
import { IConfig } from '../../../../shared/model/config/IConfig';
import { CardinalMock } from '../../../../testing/mocks/CardinalMock';
import { PaymentEvents } from '../../models/constants/PaymentEvents';
import { environment } from '../../../../environments/environment';
import { ICard } from '../../models/ICard';
import { IOnCardinalValidated } from '../../models/IOnCardinalValidated';
import SpyInstance = jest.SpyInstance;
import { first, switchMap } from 'rxjs/operators';
import { PaymentBrand } from '../../models/constants/PaymentBrand';
import { ofType } from '../../../../shared/services/message-bus/operators/ofType';
import { RequestType } from '../../../../shared/types/RequestType';
import { SimpleMessageBus } from '../../shared/message-bus/SimpleMessageBus';
import { IMessageBus } from '../../shared/message-bus/IMessageBus';

describe('CardinalCommerce', () => {
  const tokens: ICardinalCommerceTokens = { jwt: 'foo', cacheToken: 'bar' };
  const config: IConfig = ({ livestatus: false, init: {} } as unknown) as IConfig;
  let messageBusMock: IMessageBus;
  let notificationMock: NotificationService;
  let framesHubMock: FramesHub;
  let tokenProviderMock: CardinalCommerceTokensProvider;
  let stTransportMock: StTransport;
  let cardinalProviderMock: CardinalProvider;
  let cardinalCommerce: CardinalCommerce;
  let cardinalMock: ICardinal;

  beforeEach(() => {
    cardinalMock = new CardinalMock();
    messageBusMock = new SimpleMessageBus();
    notificationMock = mock(NotificationService);
    framesHubMock = mock(FramesHub);
    tokenProviderMock = mock(CardinalCommerceTokensProvider);
    stTransportMock = mock(StTransport);
    cardinalProviderMock = mock(CardinalProvider);

    when(tokenProviderMock.getTokens()).thenReturn(of(tokens));
    when(cardinalProviderMock.getCardinal$(false)).thenReturn(of(cardinalMock));

    cardinalCommerce = new CardinalCommerce(
      messageBusMock,
      instance(notificationMock),
      instance(framesHubMock),
      instance(tokenProviderMock),
      instance(stTransportMock),
      instance(cardinalProviderMock)
    );
  });

  describe('init', () => {
    it('returns cardinal instance', done => {
      cardinalCommerce.init(config).subscribe(cardinal => {
        expect(cardinal).toBe(cardinalMock);
        done();
      });
    });

    it('publishes acquired cardinal tokens', done => {
      jest.spyOn(messageBusMock, 'publish');

      cardinalCommerce.init(config).subscribe(() => {
        expect(messageBusMock.publish).toHaveBeenCalledWith({
          type: MessageBus.EVENTS_PUBLIC.CARDINAL_COMMERCE_TOKENS_ACQUIRED,
          data: tokens
        });
        done();
      });
    });

    it('calls cardinal configure, setup, and sets event listeners', done => {
      jest.spyOn(cardinalMock, 'configure');
      jest.spyOn(cardinalMock, 'setup');
      jest.spyOn(cardinalMock, 'on');

      cardinalCommerce.init(config).subscribe(cardinal => {
        expect(cardinalMock.setup).toHaveBeenCalledWith(PaymentEvents.INIT, { jwt: 'foo' });
        expect(cardinalMock.configure).toHaveBeenCalledWith(environment.CARDINAL_COMMERCE.CONFIG);
        expect(cardinalMock.on).toHaveBeenCalledWith(CardinalCommerce.UI_EVENTS.RENDER, jasmine.anything());
        expect(cardinalMock.on).toHaveBeenCalledWith(CardinalCommerce.UI_EVENTS.CLOSE, jasmine.anything());
        expect(cardinalMock.on).toHaveBeenCalledWith(PaymentEvents.VALIDATED, jasmine.anything());
        expect(cardinalMock.on).toHaveBeenCalledWith(PaymentEvents.SETUP_COMPLETE, jasmine.anything());
        done();
      });
    });

    it('re-acquires tokens merchants jwt update', done => {
      cardinalCommerce.init(config).subscribe(() => {
        when(tokenProviderMock.getTokens()).thenReturn(of({ jwt: 'foo2', cacheToken: 'bar2' }));

        messageBusMock
          .pipe(ofType(MessageBus.EVENTS_PUBLIC.CARDINAL_COMMERCE_TOKENS_ACQUIRED), first())
          .subscribe(event => {
            expect(event.data).toEqual({ jwt: 'foo2', cacheToken: 'bar2' });
            done();
          });

        messageBusMock.publish({ type: MessageBus.EVENTS_PUBLIC.UPDATE_JWT, data: { newJwt: 'foobar' } });
      });
    });

    it('runs bin process on message bus event', done => {
      cardinalCommerce.init(config).subscribe(cardinal => {
        const pan = '4100000000000000';
        jest.spyOn(cardinal, 'trigger');

        messageBusMock.publish({ type: MessageBus.EVENTS_PUBLIC.BIN_PROCESS, data: pan });

        expect(cardinal.trigger).toHaveBeenCalledWith(PaymentEvents.BIN_PROCESS, pan);
        done();
      });
    });

    it('unsubscribes cardinal listeners on destroy', done => {
      cardinalCommerce.init(config).subscribe(cardinal => {
        jest.spyOn(cardinal, 'off');

        messageBusMock.publish({ type: MessageBus.EVENTS_PUBLIC.DESTROY });

        expect(cardinal.off).toHaveBeenCalledWith(PaymentEvents.SETUP_COMPLETE);
        expect(cardinal.off).toHaveBeenCalledWith(PaymentEvents.VALIDATED);
        expect(cardinal.off).toHaveBeenCalledWith(CardinalCommerce.UI_EVENTS.RENDER);
        expect(cardinal.off).toHaveBeenCalledWith(CardinalCommerce.UI_EVENTS.CLOSE);
        done();
      });
    });

    it('publishes events to message bus on popup render/hide', done => {
      const publishSpy = jest.spyOn(messageBusMock, 'publish');

      cardinalCommerce.init(config).subscribe(cardinal => {
        cardinal.trigger(CardinalCommerce.UI_EVENTS.RENDER);
        expect(publishSpy).toHaveBeenCalledWith({ type: MessageBus.EVENTS_PUBLIC.CONTROL_FRAME_SHOW }, true);

        cardinal.trigger(CardinalCommerce.UI_EVENTS.CLOSE);
        expect(publishSpy).toHaveBeenCalledWith({ type: MessageBus.EVENTS_PUBLIC.CONTROL_FRAME_HIDE }, true);
        done();
      });
    });
  });

  describe('performThreeDQuery', () => {
    const requestTypes: RequestType[] = ['THREEDQUERY', 'AUTH'];
    const card: ICard = { pan: '4100000000000000', securitycode: '123', expirydate: '01/23' };
    const merchantData = { abc: 'abc' };
    const threeDQueryRequest = {
      cachetoken: 'bar',
      termurl: 'https://termurl.com',
      ...merchantData,
      ...card
    };
    const threeDQueryResponse = {
      acquirertransactionreference: '12345',
      acsurl: 'https://foo.bar.com',
      enrolled: 'Y',
      threedpayload: 'aaabbb',
      transactionreference: 'cccddd'
    };
    const cardinalContinueJwt = 'fgewtwg2rfrgwef32rf23rfwsdf';
    let cardinalContinueSpy: SpyInstance;

    beforeEach(() => {
      cardinalContinueSpy = jest.spyOn(cardinalMock, 'continue');

      when(stTransportMock.sendRequest(deepEqual(threeDQueryRequest))).thenReturn(
        Promise.resolve({
          jwt: 'jwt',
          response: threeDQueryResponse
        })
      );

      cardinalContinueSpy.mockImplementationOnce(
        (paymentBrand: string, continueObject: IContinueObject, orderObject?: IOrderObject, jwt?: string) => {
          const data: IOnCardinalValidated = {
            ActionCode: 'SUCCESS',
            ErrorDescription: '',
            ErrorNumber: 0,
            Validated: true
          };
          setTimeout(() => {
            cardinalMock.trigger(PaymentEvents.VALIDATED, data, cardinalContinueJwt);
          });
        }
      );
    });

    it('runs cardinal.start and returns threedresponse and cache token', done => {
      spyOn(cardinalMock, 'start').and.callThrough();

      cardinalCommerce
        .init(config)
        .pipe(switchMap(() => cardinalCommerce.performThreeDQuery(requestTypes, card, merchantData)))
        .subscribe(result => {
          expect(result).toEqual({
            ...threeDQueryResponse,
            threedresponse: cardinalContinueJwt,
            cachetoken: 'bar',
            jwt: 'jwt'
          });
          expect(cardinalMock.start).toHaveBeenCalledWith(PaymentBrand, {}, 'foo');
          done();
        });
    });

    it('runs cardinal continue with proper params', done => {
      cardinalCommerce
        .init(config)
        .pipe(switchMap(() => cardinalCommerce.performThreeDQuery(requestTypes, card, merchantData)))
        .subscribe(result => {
          expect(cardinalContinueSpy).toHaveBeenCalledWith(
            'cca',
            {
              AcsUrl: 'https://foo.bar.com',
              Payload: 'aaabbb'
            },
            {
              Cart: [],
              OrderDetails: {
                TransactionId: '12345'
              }
            },
            'foo'
          );
          done();
        });
    });

    it('doesnt run cardinal continue when card is not enrolled', done => {
      when(stTransportMock.sendRequest(deepEqual(threeDQueryRequest))).thenReturn(
        Promise.resolve({
          response: {
            ...threeDQueryResponse,
            enrolled: 'U'
          }
        })
      );

      cardinalCommerce
        .init(config)
        .pipe(switchMap(() => cardinalCommerce.performThreeDQuery(requestTypes, card, merchantData)))
        .subscribe(result => {
          expect(cardinalContinueSpy).not.toHaveBeenCalled();
          done();
        });
    });

    it('doesnt run cardinal continue when acs url is undefined', done => {
      when(stTransportMock.sendRequest(deepEqual(threeDQueryRequest))).thenReturn(
        Promise.resolve({
          response: {
            ...threeDQueryResponse,
            acsurl: undefined
          }
        })
      );

      cardinalCommerce
        .init(config)
        .pipe(switchMap(() => cardinalCommerce.performThreeDQuery(requestTypes, card, merchantData)))
        .subscribe(result => {
          expect(cardinalContinueSpy).not.toHaveBeenCalled();
          done();
        });
    });

    it('throws an error when cardinal validation result does not contain action code', done => {
      const validationResult: IOnCardinalValidated = {
        ActionCode: undefined,
        ErrorDescription: '',
        ErrorNumber: 0,
        Validated: true
      };

      cardinalContinueSpy.mockReset();
      cardinalContinueSpy.mockImplementationOnce((...args: any[]) => {
        setTimeout(() => {
          cardinalMock.trigger(PaymentEvents.VALIDATED, validationResult, cardinalContinueJwt);
        });
      });

      cardinalCommerce
        .init(config)
        .pipe(switchMap(() => cardinalCommerce.performThreeDQuery(requestTypes, card, merchantData)))
        .subscribe({
          error: result => {
            expect(result).toEqual({
              acquirerresponsecode: '0',
              acquirerresponsemessage: '',
              acquirertransactionreference: '12345',
              acsurl: 'https://foo.bar.com',
              cachetoken: 'bar',
              enrolled: 'Y',
              errorcode: '50003',
              errormessage: 'An error occurred',
              jwt: 'jwt',
              threedpayload: 'aaabbb',
              threedresponse: 'fgewtwg2rfrgwef32rf23rfwsdf',
              transactionreference: 'cccddd'
            });
            done();
          }
        });
    });

    it('publishes response including threedpayload on failed verification', done => {
      const validationResult: IOnCardinalValidated = {
        ActionCode: 'FAILURE',
        ErrorDescription: 'desc',
        ErrorNumber: 1234,
        Validated: false
      };

      cardinalContinueSpy.mockReset();
      cardinalContinueSpy.mockImplementationOnce((...args: any[]) => {
        setTimeout(() => {
          cardinalMock.trigger(PaymentEvents.VALIDATED, validationResult, cardinalContinueJwt);
        });
      });

      cardinalCommerce
        .init(config)
        .pipe(switchMap(() => cardinalCommerce.performThreeDQuery(requestTypes, card, merchantData)))
        .subscribe({
          error: result => {
            expect(result).toEqual({
              acquirertransactionreference: '12345',
              acsurl: 'https://foo.bar.com',
              enrolled: 'Y',
              threedpayload: 'aaabbb',
              transactionreference: 'cccddd',
              jwt: 'jwt',
              acquirerresponsecode: '1234',
              acquirerresponsemessage: 'desc',
              errorcode: '50003',
              errormessage: 'An error occurred',
              threedresponse: cardinalContinueJwt,
              cachetoken: 'bar'
            });
            done();
          }
        });
    });
  });
});
