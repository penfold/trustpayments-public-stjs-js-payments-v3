import { instance, mock, when } from 'ts-mockito';
import { ContainerInstance } from 'typedi';
import { ClickToPayAdapterFactory } from './ClickToPayAdapterFactory';
import { ClickToPayAdapterName } from './ClickToPayAdapterName';
import { HPPClickToPayAdapter } from './hpp-adapter/HPPClickToPayAdapter';

describe('ClickToPayAdapterFactory()', () => {
  const containerMock: ContainerInstance = mock(ContainerInstance);
  const hPPClickToPayAdapterMock: HPPClickToPayAdapter = mock(HPPClickToPayAdapter);
  const hPPClickToPayAdapterInstance: HPPClickToPayAdapter = instance(hPPClickToPayAdapterMock);
  let sut: ClickToPayAdapterFactory;

  beforeEach(() => {
    sut = new ClickToPayAdapterFactory(instance(containerMock));
    when(containerMock.get(HPPClickToPayAdapter)).thenReturn(hPPClickToPayAdapterInstance);
  });

  describe('create()', () => {
    it('should return instance of adapter class depending on input parameter', () => {
      expect(sut.create(ClickToPayAdapterName.hpp)).toBe(hPPClickToPayAdapterInstance);
    });
  });
});
