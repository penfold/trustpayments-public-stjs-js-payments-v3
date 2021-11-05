import { ContainerInstance } from 'typedi';
import { instance, mock, verify, when } from 'ts-mockito';
import { FrameIdentifier } from '../../../shared/services/message-bus/FrameIdentifier';
import { CombinedReducerFactory } from './CombinedReducerFactory';
import { StoreFactory } from './StoreFactory';
import { CombinedReducer } from './CombinedReducer';
import { ParentFrameStore } from './store/ParentFrameStore';
import { ControlFrameStore } from './store/ControlFrameStore';
import { LinkedStore } from './store/LinkedStore';
import { IApplicationFrameState } from './state/IApplicationFrameState';

describe('StoreFactory', () => {
  const combinedReducer = new CombinedReducer<IApplicationFrameState>([]);
  let frameIdentifierMock: FrameIdentifier;
  let containerMock: ContainerInstance;
  let combinedReducerFactoryMock: CombinedReducerFactory;
  let storeFactory: StoreFactory;
  let parentFrameStoreMock: ParentFrameStore;
  let controlFrameStoreMock: ControlFrameStore;
  let linkedStoreMock: LinkedStore;
  let parentFrameStore: ParentFrameStore;
  let controlFrameStore: ControlFrameStore;
  let linkedStore: LinkedStore;

  beforeEach(() => {
    frameIdentifierMock = mock(FrameIdentifier);
    containerMock = mock(ContainerInstance);
    combinedReducerFactoryMock = mock(CombinedReducerFactory);
    storeFactory = new StoreFactory(
      instance(frameIdentifierMock),
      instance(containerMock),
      instance(combinedReducerFactoryMock)
    );

    parentFrameStoreMock = mock(ParentFrameStore);
    controlFrameStoreMock = mock(ControlFrameStore);
    linkedStoreMock = mock(LinkedStore);
    parentFrameStore = instance(parentFrameStoreMock);
    controlFrameStore = instance(controlFrameStoreMock);
    linkedStore = instance(linkedStoreMock);

    when(combinedReducerFactoryMock.getCombinedReducer()).thenReturn(combinedReducer);
    when(frameIdentifierMock.isControlFrame()).thenReturn(false);
    when(frameIdentifierMock.isParentFrame()).thenReturn(false);
    when(containerMock.get(ParentFrameStore)).thenReturn(parentFrameStore);
    when(containerMock.get(ControlFrameStore)).thenReturn(controlFrameStore);
    when(containerMock.get(LinkedStore)).thenReturn(linkedStore);
  });

  it('creates a Store for parent frame', () => {
    when(frameIdentifierMock.isParentFrame()).thenReturn(true);

    const store = storeFactory.create();

    expect(store).toBe(parentFrameStore);

    verify(parentFrameStoreMock.addReducer(combinedReducer)).once();
  });

  it('creates a Store for control frame', () => {
    when(frameIdentifierMock.isControlFrame()).thenReturn(true);

    const store = storeFactory.create();

    expect(store).toBe(controlFrameStore);

    verify(controlFrameStoreMock.addReducer(combinedReducer)).once();
  });

  it('creates LinkedStore for all other frames', () => {
    const store = storeFactory.create();

    expect(store).toBe(linkedStore);
  });
});
