import 'location-origin';
import 'url-polyfill';
import 'whatwg-fetch';
import './control-frame.scss';
import { ControlFrame } from './ControlFrame';
import { Container } from 'typedi';
import { ConfigService } from '../../../client/config/ConfigService';
import { FrameIdentifier } from '../../../shared/services/message-bus/FrameIdentifier';
import { Selectors } from '../../core/shared/Selectors';

(() => {
  Container.get(FrameIdentifier).setFrameName(Selectors.CONTROL_FRAME_IFRAME);
  Container.get(ConfigService).clear(false);

  return Container.get(ControlFrame);
})();
