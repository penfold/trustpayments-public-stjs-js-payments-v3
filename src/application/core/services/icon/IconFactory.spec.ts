import { mock, instance as mockInstance, when } from 'ts-mockito';
import { IconFactory } from './IconFactory';
import { IconMap, mapIcon } from './IconMap';

describe('IconFactory', () => {
  const iconMap: IconMap = mock(IconMap);
  Object.keys(mapIcon).map(item => {
    when(iconMap.getUrl(item)).thenReturn(mapIcon[item]);
  });

  let instance: IconFactory;

  beforeEach(() => {
    instance = new IconFactory(mockInstance(iconMap));
  });

  it('should return icon with proper image URI', () => {
    Object.keys(mapIcon).map(item => {
      expect(instance.getIcon(item).getAttribute('src')).toEqual(mapIcon[item]);
    });
  });
});
