import { DeviceSupport } from './DeviceSupport';
import { Container } from 'typedi';

describe('DeviceSupport', () => {
  let deviceSupport: DeviceSupport;

  beforeEach(() => {
    deviceSupport = Container.get(DeviceSupport);
  });

  it('should return false when device version is not provided', () => {
    expect(deviceSupport.isDeviceSupported(undefined, null)).toEqual(false);
  });

  it('should return true when OS is diffrent than Android/iOS', () => {
    expect(deviceSupport.isDeviceSupported('10', 'Windows')).toEqual(true);
  });

  describe('Android', () => {
    it('should return true when selected version has support', () => {
      expect(deviceSupport.isDeviceSupported('8', 'Android')).toEqual(true);
    });

    it('should return false when selected version does not have support', () => {
      expect(deviceSupport.isDeviceSupported('5', 'Android')).toEqual(false);
    });

    it('should return true when selected a specific version', () => {
      expect(deviceSupport.isDeviceSupported('9.1.2', 'Android')).toEqual(true);
    });
  });

  describe('iOS', () => {
    it('should return true when selected version has support', () => {
      expect(deviceSupport.isDeviceSupported('10', 'iOS')).toEqual(true);
    });

    it('should return false when selected version does not have support', () => {
      expect(deviceSupport.isDeviceSupported('9', 'iOS')).toEqual(false);
    });

    it('should return true when selected a specific version', () => {
      expect(deviceSupport.isDeviceSupported('13.1.2', 'iOS')).toEqual(true);
    });
  });
});
