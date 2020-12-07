import { FrameIdentifier } from '../../../../shared/services/message-bus/FrameIdentifier';
import { ContainerInstance } from 'typedi';
import { MessageBusFactory } from './MessageBusFactory';
import { instance, mock, when } from 'ts-mockito';
import { ParentFrameMessageBus } from './ParentFrameMessageBus';
import { ControlFrameMessageBus } from './ControlFrameMessageBus';
import { ApplicationFrameMessageBus } from './ApplicationFrameMessageBus';

describe('MessageBusFactory', () => {
  let frameIdentifierMock: FrameIdentifier;
  let containerMock: ContainerInstance;
  let messageBusFactory: MessageBusFactory;

  const parentFrameMessageBus: ParentFrameMessageBus = instance(mock(ParentFrameMessageBus));
  const controlFrameMessageBus: ControlFrameMessageBus = instance(mock(ControlFrameMessageBus));
  const applicationFrameMessageBus: ApplicationFrameMessageBus = instance(mock(ApplicationFrameMessageBus));

  beforeEach(() => {
    frameIdentifierMock = mock(FrameIdentifier);
    containerMock = mock(ContainerInstance);
    messageBusFactory = new MessageBusFactory(instance(frameIdentifierMock), instance(containerMock));

    when(frameIdentifierMock.isParentFrame()).thenReturn(false);
    when(frameIdentifierMock.isControlFrame()).thenReturn(false);
    when(containerMock.get(ParentFrameMessageBus)).thenReturn(parentFrameMessageBus);
    when(containerMock.get(ControlFrameMessageBus)).thenReturn(controlFrameMessageBus);
    when(containerMock.get(ApplicationFrameMessageBus)).thenReturn(applicationFrameMessageBus);
  });

  it('creates ParentFrameMessageBus inside parent frame', () => {
    when(frameIdentifierMock.isParentFrame()).thenReturn(true);

    expect(messageBusFactory.create()).toBe(parentFrameMessageBus);
  });

  it('creates ControlFrameMessageBus inside control frame', () => {
    when(frameIdentifierMock.isControlFrame()).thenReturn(true);

    expect(messageBusFactory.create()).toBe(controlFrameMessageBus);
  });

  it('creates ApplicationFrameMessageBus in other frames', () => {
    expect(messageBusFactory.create()).toBe(applicationFrameMessageBus);
  });
});
