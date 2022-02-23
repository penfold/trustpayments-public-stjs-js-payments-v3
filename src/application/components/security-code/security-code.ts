import './security-code.scss';
import '../../core/shared/override-domain/OverrideDomain';
import { Container, ContainerInstance } from 'typedi';
import { ComponentBootstrap } from '../../core/component-bootstrap/ComponentBootstrap';
import { SECURITY_CODE_IFRAME } from '../../core/models/constants/Selectors';
import { WINDOW } from '../../../shared/dependency-injection/InjectionTokens';
import { initializeContainer } from '../../dependency-injection/ServiceDefinitions';
import { SecurityCode } from './SecurityCode';

(() => {
  const container = Container.of(undefined);
  container.set(WINDOW, window);
  container.set(ContainerInstance, container);
  initializeContainer(container);
  Container.get(ComponentBootstrap).run(SECURITY_CODE_IFRAME, SecurityCode);
})();
