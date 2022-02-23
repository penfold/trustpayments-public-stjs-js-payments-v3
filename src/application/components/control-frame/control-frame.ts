import './control-frame.scss';
import '../../core/shared/override-domain/OverrideDomain';
import { Container, ContainerInstance } from 'typedi';
import { ComponentBootstrap } from '../../core/component-bootstrap/ComponentBootstrap';
import { CONTROL_FRAME_IFRAME } from '../../core/models/constants/Selectors';
import { initializeContainer } from '../../../application/dependency-injection/ServiceDefinitions';
import { WINDOW } from '../../../shared/dependency-injection/InjectionTokens';
import { ControlFrame } from './ControlFrame';

(() => {
  const container = Container.of(undefined);
  container.set(WINDOW, window);
  container.set(ContainerInstance, container);
  initializeContainer(container);
  container.get(ComponentBootstrap).run(CONTROL_FRAME_IFRAME, ControlFrame);
})();
