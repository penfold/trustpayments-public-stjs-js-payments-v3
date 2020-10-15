import { Service } from 'typedi';
import { SupportedAndroidVersions, SupportedIOSVersions } from '../SupportedOSs';

@Service()
export class DeviceSupport {
  isDeviceSupported(version: string, name: string): boolean {
    if (version === undefined) {
      return false;
    }

    const dotIndex: number = version.indexOf('.');

    if (name === 'Android' && dotIndex === -1) {
      return this.hasMainVersion(SupportedAndroidVersions, version);
    }
    if (name === 'Android' && dotIndex !== -1) {
      return this.hasSpecificVersion(SupportedAndroidVersions, version, dotIndex);
    }
    if (name === 'iOS' && dotIndex === -1) {
      return this.hasMainVersion(SupportedIOSVersions, version);
    }
    if (name === 'iOS' && dotIndex !== -1) {
      return this.hasSpecificVersion(SupportedIOSVersions, version, dotIndex);
    }

    return true;
  }

  private hasMainVersion(array: number[], version: string): boolean {
    return array.includes(Number(Number(version).toFixed(0)));
  }

  private hasSpecificVersion(array: number[], version: string, dotIndex: number): boolean {
    return array.includes(Number(Number(version.substr(0, dotIndex)).toFixed(0)));
  }
}
