import { JwtDecoder } from '../../../../shared/services/jwt-decoder/JwtDecoder';
import { RemainingRequestTypesProvider } from './RemainingRequestTypesProvider';
import { instance, mock, when } from 'ts-mockito';
import { TestStore } from '../../store/store/TestStore';
import { BehaviorSubject } from 'rxjs';
import { IApplicationFrameState } from '../../store/state/IApplicationFrameState';

describe('RemainingRequestTypesProvider', () => {
  let jwtDecoderMock: JwtDecoder;
  let store: TestStore<IApplicationFrameState>;
  let remainingRequestTypesProvider: RemainingRequestTypesProvider;

  beforeEach(() => {
    jwtDecoderMock = mock(JwtDecoder);
    store = new TestStore(new BehaviorSubject({} as IApplicationFrameState));
    remainingRequestTypesProvider = new RemainingRequestTypesProvider(
      store,
      instance(jwtDecoderMock),
    );
  });

  it('should return remaining request types from the jwt in store', done => {
    when(jwtDecoderMock.decode('somejwt')).thenReturn({
      payload: {
        requesttypedescriptions: ['THREEDQUERY', 'AUTH'],
      },
    });

    remainingRequestTypesProvider.getRemainingRequestTypes().subscribe(requestTypes => {
      expect(requestTypes).toEqual(['THREEDQUERY', 'AUTH']);
      done();
    });

    store.setState({ jwt: 'somejwt' } as IApplicationFrameState);
  });
});
