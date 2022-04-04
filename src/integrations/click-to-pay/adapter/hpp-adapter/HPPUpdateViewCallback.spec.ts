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
    const updateData = { 
      displayCardForm: true, 
      displaySubmitButton: true,
      displayMaskedCardNumber: null,
      displayCardType: null,
    };
    sut.init(testInitParams.onUpdateView);
    sut.callUpdateViewCallback(updateData);
    expect(testInitParams.onUpdateView).toHaveBeenCalledWith(updateData);
  });
})
