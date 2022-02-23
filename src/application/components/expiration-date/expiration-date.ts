import './expiration-date.scss';
import '../../core/shared/override-domain/OverrideDomain';
import { Container, ContainerInstance } from 'typedi';
import { ComponentBootstrap } from '../../core/component-bootstrap/ComponentBootstrap';
import { EXPIRATION_DATE_IFRAME } from '../../core/models/constants/Selectors';
import { WINDOW } from '../../../shared/dependency-injection/InjectionTokens';
import { initializeContainer } from '../../dependency-injection/ServiceDefinitions';
import { ExpirationDate } from './ExpirationDate';

(() => {
  const container = Container.of(undefined);
  container.set(WINDOW, window);
  container.set(ContainerInstance, container);
  initializeContainer(container);
  Container.get(ComponentBootstrap).run(EXPIRATION_DATE_IFRAME, ExpirationDate);
})();
