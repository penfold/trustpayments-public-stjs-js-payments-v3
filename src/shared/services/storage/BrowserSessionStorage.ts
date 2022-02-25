import { Service } from 'typedi';
import { InterFrameCommunicator } from '../message-bus/InterFrameCommunicator';
import { FramesHub } from '../message-bus/FramesHub';
import { FrameIdentifier } from '../message-bus/FrameIdentifier';
import { AbstractStorage } from './AbstractStorage';
@Service()
export class BrowserSessionStorage extends AbstractStorage {
  constructor(communicator: InterFrameCommunicator, framesHub: FramesHub, identifier: FrameIdentifier) {
    super(window.sessionStorage, communicator, framesHub, identifier);
  }

  protected getSychronizationEventName(): string {
    return 'ST_SET_SESSION_STORAGE_ITEM';
  }
}
