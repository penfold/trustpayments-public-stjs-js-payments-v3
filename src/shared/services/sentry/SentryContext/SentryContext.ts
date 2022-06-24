import { Service } from 'typedi';
import { FrameIdentifier } from '../../message-bus/FrameIdentifier';

@Service()
export class SentryContext {
  constructor(private frameIdentifier: FrameIdentifier) {}

  getFrameName(): string {
    return this.frameIdentifier.getFrameName();
  }

  getHostName(): string {
    return window.location.hostname;
  }

  getReleaseVersion(): string {
    return require('../../../../../package.json').version;
  }
}
