import './control-frame.scss';
import '../../core/shared/override-domain/OverrideDomain';
import { Container } from 'typedi';
import { ComponentBootstrap } from '../../core/component-bootstrap/ComponentBootstrap';
import { CONTROL_FRAME_IFRAME } from '../../core/models/constants/Selectors';
import { ControlFrame } from './ControlFrame';

(() => {
  Container.get(ComponentBootstrap).run(CONTROL_FRAME_IFRAME, ControlFrame);
})();
