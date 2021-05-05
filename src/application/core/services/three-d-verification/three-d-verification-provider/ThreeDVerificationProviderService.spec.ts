import { instance, mock, when } from 'ts-mockito';
import { ContainerInstance } from 'typedi';
import { CardinalCommerceVerificationService } from '../implementations/CardinalCommerceVerificationService';
import { ThreeDSecureVerificationService } from '../implementations/three-d-secure/ThreeDSecureVerificationService';
import { ThreeDVerificationProvider } from '../ThreeDVerificationProvider';
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
    it(`should get ThreeDSecureVerificationService provider when ${ThreeDVerificationProvider.TP} set`, () => {
      expect(sut.getProvider(ThreeDVerificationProvider.TP)).toEqual(instance(threeDSecureVerificationServiceMock));
    });

    it(`should get CardinalCommerceVerificationService provider when ${ThreeDVerificationProvider.CARDINAL} set`, () => {
      expect(sut.getProvider(ThreeDVerificationProvider.CARDINAL)).toBe(instance(cardinalCommerceVerificationServiceMock));
    });
  });
});
