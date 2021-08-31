import { HideProcessingScreenErrorHandler } from './HideProcessingScreenErrorHandler';
import { IMessageBus } from '../../../shared/message-bus/IMessageBus';
import { deepEqual, instance, mock, verify } from 'ts-mockito';
import { IRequestProcessingOptions } from '../IRequestProcessingOptions';
import { IThreeDInitResponse } from '../../../models/IThreeDInitResponse';
import { ThreeDVerificationProviderName } from '../../three-d-verification/data/ThreeDVerificationProviderName';
import { of } from 'rxjs';
import { PUBLIC_EVENTS } from '../../../models/constants/EventTypes';
import { EventScope } from '../../../models/constants/EventScope';

describe('HideProcessingScreenErrorHandler', () => {
  const sampleError = new Error();
  const jsInitResponse: IThreeDInitResponse = {
    jwt: '',
    threedsprovider: ThreeDVerificationProviderName.CARDINAL,
  };

  let messageBusMock: IMessageBus;
  let hideProcessingScreenErrorHandler: HideProcessingScreenErrorHandler;

  beforeEach(() => {
    messageBusMock = mock<IMessageBus>();
    hideProcessingScreenErrorHandler = new HideProcessingScreenErrorHandler(instance(messageBusMock));
  });

  it('should publish THREE_D_SECURE_PROCESSING_SCREEN_HIDE event and rethrow the error after timer', done => {
    const options: IRequestProcessingOptions = {
      jsInitResponse,
      timer: of(0),
    };

    hideProcessingScreenErrorHandler.handle(sampleError, {}, options).subscribe({
      error: error => {
        verify(messageBusMock.publish(deepEqual({ type: PUBLIC_EVENTS.THREE_D_SECURE_PROCESSING_SCREEN_HIDE }),  EventScope.ALL_FRAMES)).once();
        expect(error).toBe(sampleError);
        done();
      },
    });
  });

  it('should publish THREE_D_SECURE_PROCESSING_SCREEN_HIDE event and rethrow the error when timer is not provided in options', done => {
    const options: IRequestProcessingOptions = {
      jsInitResponse,
    };

    hideProcessingScreenErrorHandler.handle(sampleError, {}, options).subscribe({
      error: error => {
        verify(messageBusMock.publish(deepEqual({ type: PUBLIC_EVENTS.THREE_D_SECURE_PROCESSING_SCREEN_HIDE }),  EventScope.ALL_FRAMES)).once();
        expect(error).toBe(sampleError);
        done();
      },
    });
  });
});
