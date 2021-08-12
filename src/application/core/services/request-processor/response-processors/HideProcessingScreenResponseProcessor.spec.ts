import { mock, instance, when, verify, anything, deepEqual } from 'ts-mockito';
import { HideProcessingScreenResponseProcessor } from './HideProcessingScreenResponseProcessor';
import { InterFrameCommunicator } from '../../../../../shared/services/message-bus/InterFrameCommunicator';
import { IRequestProcessingOptions } from '../IRequestProcessingOptions';
import { timer } from 'rxjs';
import { IRequestTypeResponse } from '../../st-codec/interfaces/IRequestTypeResponse';
import { IJwtResponse } from '../../st-codec/interfaces/IJwtResponse';
import { IStRequest } from '../../../models/IStRequest';
import { PUBLIC_EVENTS } from '../../../models/constants/EventTypes';
import { MERCHANT_PARENT_FRAME } from '../../../models/constants/Selectors';

describe('HideProcessingScreenResponseProcessor', () => {
  let interFrameCommunicatorMock: InterFrameCommunicator;
  let hideProcessingScreenResponseProcessor: HideProcessingScreenResponseProcessor;

  const response: IRequestTypeResponse & IJwtResponse = {
    jwt: '',
  };
  const request: IStRequest = {};
  const options: IRequestProcessingOptions = {
    jsInitResponse: undefined,
    timer: timer(0),
  }

  beforeEach(() => {
    interFrameCommunicatorMock = mock(InterFrameCommunicator);
    hideProcessingScreenResponseProcessor = new HideProcessingScreenResponseProcessor(
      instance(interFrameCommunicatorMock),
    );

    when(interFrameCommunicatorMock.query(anything(),anything())).thenResolve(null);
  });

  describe('process()', () => {
    it('returns unmodified response', done => {
      hideProcessingScreenResponseProcessor.process(response, request, options).subscribe(result => {
        expect(result).toBe(response);
        done();
      });
    });

    it('sends the THREE_D_SECURE_PROCESSING_SCREEN_HIDE event after timer', done => {
      hideProcessingScreenResponseProcessor.process(response, request, options).subscribe(result => {
        verify(interFrameCommunicatorMock.query(deepEqual({
          type: PUBLIC_EVENTS.THREE_D_SECURE_PROCESSING_SCREEN_HIDE,
        }), MERCHANT_PARENT_FRAME)).once();
        done();
      });
    });

    it('sends the THREE_D_SECURE_PROCESSING_SCREEN_HIDE event when timer is not specified', done => {
      const { timer, ...optionsWithoutTimer } = options;
      hideProcessingScreenResponseProcessor.process(response, request, optionsWithoutTimer).subscribe(result => {
        verify(interFrameCommunicatorMock.query(deepEqual({
          type: PUBLIC_EVENTS.THREE_D_SECURE_PROCESSING_SCREEN_HIDE,
        }), MERCHANT_PARENT_FRAME)).once();
        done();
      });
    });
  });
});
