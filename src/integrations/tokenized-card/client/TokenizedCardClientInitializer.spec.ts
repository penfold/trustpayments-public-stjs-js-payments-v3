import { anyFunction, anything, instance, mock, verify, when } from 'ts-mockito';
import { FrameQueryingServiceMock } from '../../../shared/services/message-bus/FrameQueryingServiceMock';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { TokenizedCardClientInitializer } from './TokenizedCardClientInitializer';
import { TokenizedCardClient } from './TokenizedCardClient';

let tokenizedCardClientInitializer: TokenizedCardClientInitializer
const tokenizedCardClient = mock(TokenizedCardClient)
const frameQueryingService = mock(FrameQueryingServiceMock)

describe('TokenizedCardClientInitializer', () => {

  beforeEach(() => {
    tokenizedCardClientInitializer = new TokenizedCardClientInitializer(instance(tokenizedCardClient), instance(frameQueryingService))
  })

  it(`should listen to event ${PUBLIC_EVENTS.TOKENIZED_CARD_CLIENT_INIT} and run the TokenizedCardClient init()`, () => {
    when(frameQueryingService.whenReceive(PUBLIC_EVENTS.TOKENIZED_CARD_CLIENT_INIT, anyFunction())).thenCall((eventType, callback) => {
      callback({ type: eventType, data: null })
    })

    tokenizedCardClientInitializer.register()

    verify(tokenizedCardClient.init(anything())).once()
  })
})
