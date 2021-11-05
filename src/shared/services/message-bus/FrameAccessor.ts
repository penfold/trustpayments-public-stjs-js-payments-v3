import { Inject, Service } from 'typedi';
import { WINDOW } from '../../dependency-injection/InjectionTokens';
import IControlFrameWindow from '../../interfaces/IControlFrameWindow';
import { CONTROL_FRAME_IFRAME } from '../../../application/core/models/constants/Selectors';
import { FrameCollection } from './interfaces/FrameCollection';
import { FrameIdentifier } from './FrameIdentifier';
import { FrameNotFound } from './errors/FrameNotFound';

@Service()
export class FrameAccessor {
  constructor(private identifier: FrameIdentifier, @Inject(WINDOW) private window: Window) {}

  getParentFrame(): Window {
    if (this.identifier.isParentFrame()) {
      return this.window;
    }

    return this.window.parent;
  }

  getControlFrame(): IControlFrameWindow | undefined {
    if (this.identifier.isControlFrame()) {
      return this.window;
    }

    return this.getFrameCollection()[CONTROL_FRAME_IFRAME];
  }

  hasFrame(name: string): boolean {
    return this.getFrameCollection()[name] !== undefined;
  }

  getFrame(name: string): Window {
    if (!this.hasFrame(name)) {
      throw new FrameNotFound(`Target frame "${name}" not found.`);
    }

    return this.getFrameCollection()[name];
  }

  private getFrameCollection(): FrameCollection {
    return this.getParentFrame().frames as FrameCollection;
  }
}
