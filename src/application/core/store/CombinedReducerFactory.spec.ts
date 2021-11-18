import { ContainerInstance } from 'typedi';
import { instance, mock, when } from 'ts-mockito';
import { ReducerToken } from '../../../shared/dependency-injection/InjectionTokens';
import { CombinedReducerFactory } from './CombinedReducerFactory';
import { CallbackReducer } from './CallbackReducer';
import { CombinedReducer } from './CombinedReducer';

describe('CombinedReducerFactory', () => {
  let containerMock: ContainerInstance;
  let combinedReducerFactory: CombinedReducerFactory;

  beforeEach(() => {
    containerMock = mock(ContainerInstance);
    combinedReducerFactory = new CombinedReducerFactory(instance(containerMock));
  });

  it('creates combined reducer from reducers returned by container', () => {
    const reducer1 = new CallbackReducer(() => {});
    const reducer2 = new CallbackReducer(() => {});

    when(containerMock.getMany(ReducerToken)).thenReturn([reducer1, reducer2]);

    expect(combinedReducerFactory.getCombinedReducer()).toEqual(new CombinedReducer([reducer1, reducer2]));
  });
});
