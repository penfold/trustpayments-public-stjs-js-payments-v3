import { instance, mock, when } from 'ts-mockito';
import { ContainerInstance } from 'typedi';
import { CardinalCommerceVerificationService } from './implementations/cardinal-commerce/CardinalCommerceVerificationService';
import { ThreeDSecureVerificationService } from './implementations/trust-payments/ThreeDSecureVerificationService';
import { ThreeDVerificationProviderName } from './data/ThreeDVerificationProviderName';
import { ThreeDVerificationProviderService } from './ThreeDVerificationProviderService';

describe('ThreeDVerificationProviderService', () => {
  let sut: ThreeDVerificationProviderService;
  let threeDSecureVerificationServiceMock: ThreeDSecureVerificationService;
  let cardinalCommerceVerificationServiceMock: CardinalCommerceVerificationService;
  let containerMock: ContainerInstance;

  beforeAll(() => {
    threeDSecureVerificationServiceMock = mock(ThreeDSecureVerificationService);
    cardinalCommerceVerificationServiceMock = mock(CardinalCommerceVerificationService);
    containerMock = mock(ContainerInstance);
    sut = new ThreeDVerificationProviderService(instance(containerMock));

    when(containerMock.get(ThreeDSecureVerificationService)).thenReturn(instance(threeDSecureVerificationServiceMock));
    when(containerMock.get(CardinalCommerceVerificationService)).thenReturn(instance(cardinalCommerceVerificationServiceMock));
  });

  describe('getProvider()', () => {
    it(`should get ThreeDSecureVerificationService provider when ${ThreeDVerificationProviderName.TP} set`, () => {
      expect(sut.getProvider(ThreeDVerificationProviderName.TP)).toEqual(instance(threeDSecureVerificationServiceMock));
    });

    it(`should get CardinalCommerceVerificationService provider when ${ThreeDVerificationProviderName.CARDINAL} set`, () => {
      expect(sut.getProvider(ThreeDVerificationProviderName.CARDINAL)).toBe(instance(cardinalCommerceVerificationServiceMock));
    });
  });
});
