import { HPPUpdateViewCallback } from './HPPUpdateViewCallback';

describe('HHP', () => {
  const testInitParams = {
    signInContainerId: 'containerId',
    dpaTransactionOptions: {},
    srciDpaId: 'id',
    formId: 'form',
    cardListContainerId: 'cardContainer',
    onUpdateView: jest.fn(),
  };
  let sut: HPPUpdateViewCallback;

  beforeEach(() => {
    sut = new HPPUpdateViewCallback();
  });

  it('should save provided onViewUpdateCallback in private field', () => {
    sut.init(testInitParams.onUpdateView);
    expect(sut['onUpdateViewCallback']).toEqual(testInitParams.onUpdateView);
  });
})
