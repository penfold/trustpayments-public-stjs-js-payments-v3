import { instance, mock, when } from 'ts-mockito';
import { FrameIdentifier } from '../../message-bus/FrameIdentifier';
import { CARD_NUMBER_IFRAME } from '../../../../application/core/models/constants/Selectors';
import { SentryContext } from './SentryContext';

describe('SentryContext', () => {
  let frameIdentifierMock: FrameIdentifier;
  let sentryContext: SentryContext;

  beforeEach(() => {
    frameIdentifierMock = mock(FrameIdentifier);
    sentryContext = new SentryContext(instance(frameIdentifierMock));

    when(frameIdentifierMock.getFrameName()).thenReturn(CARD_NUMBER_IFRAME);
  });

  it('returns frame name', () => {
    expect(sentryContext.getFrameName()).toEqual(CARD_NUMBER_IFRAME);
  });

  it('returns window hostname', () => {
    expect(sentryContext.getHostName()).toMatch(/.+/);
  });

  it('returns release version', () => {
    expect(sentryContext.getReleaseVersion()).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
