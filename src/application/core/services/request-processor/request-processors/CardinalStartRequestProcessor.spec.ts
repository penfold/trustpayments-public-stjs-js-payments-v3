import { mock, instance, when, verify, anything, deepEqual } from 'ts-mockito';
import { InterFrameCommunicator } from '../../../../../shared/services/message-bus/InterFrameCommunicator';
import { IStRequest } from '../../../models/IStRequest';
import { IRequestProcessingOptions } from '../IRequestProcessingOptions';
import { MERCHANT_PARENT_FRAME } from '../../../models/constants/Selectors';
import { PUBLIC_EVENTS } from '../../../models/constants/EventTypes';
import { CardinalStartRequestProcessor } from './CardinalStartRequestProcessor';

describe('CardinalStartRequestProcessor', () => {
  let interFrameCommunicatorMock: InterFrameCommunicator;
  let cardinalStartRequestProcessor: CardinalStartRequestProcessor;

  beforeEach(() => {
    interFrameCommunicatorMock = mock(InterFrameCommunicator);
    cardinalStartRequestProcessor = new CardinalStartRequestProcessor(
      instance(interFrameCommunicatorMock),
    );

    when(interFrameCommunicatorMock.query(anything(), anything())).thenResolve(undefined);
  });

  it('should send CARDINAL_START event and return unmodified request', done => {
    const request: IStRequest = {};
    const options: IRequestProcessingOptions = {
      jsInitResponse: {
        jwt: '',
        threedsprovider: undefined,
        threedinit: 'foobar',
      },
    };

    cardinalStartRequestProcessor.process(request, options).subscribe(result => {
      expect(result).toBe(request);
      verify(interFrameCommunicatorMock.query(deepEqual({
        type: PUBLIC_EVENTS.CARDINAL_START,
        data: {
          jwt: 'foobar',
        },
      }), MERCHANT_PARENT_FRAME)).once();
      done();
    });
  });
});
