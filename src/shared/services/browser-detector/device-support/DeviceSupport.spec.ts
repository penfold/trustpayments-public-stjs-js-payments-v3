import { DeviceSupport } from './DeviceSupport';

describe('DeviceSupport', () => {
  let deviceSupport: DeviceSupport;

  beforeEach(() => {
    deviceSupport = new DeviceSupport();
  });

  it.each([
    ['12', 'Android', false],
    ['8', 'Android', true],
    ['9.1.5', 'Android', true],
    ['10', 'Android', true],
    ['10', 'iOS', true],
    ['10.0.03', 'iOS', true],
    ['14', 'iOS', true],
    ['15', 'iOS', false],
    ['NT 10.0', 'Windows', true],
    ['1111', 'test', true],
    [undefined, 'test', false],
  ])('should', (version: string, name: string, isSupported: boolean) => {
    expect(deviceSupport.isDeviceSupported(version, name)).toEqual(isSupported);
  });
});
