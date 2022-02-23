import './card-number.scss';
import '../../core/shared/override-domain/OverrideDomain';
import { Container, ContainerInstance } from 'typedi';
import { ComponentBootstrap } from '../../core/component-bootstrap/ComponentBootstrap';
import { CARD_NUMBER_IFRAME } from '../../core/models/constants/Selectors';
import { WINDOW } from '../../../shared/dependency-injection/InjectionTokens';
import { initializeContainer } from '../../dependency-injection/ServiceDefinitions';
import { CardNumber } from './CardNumber';

(() => {
  const container = Container.of(undefined);
  container.set(WINDOW, window);
  container.set(ContainerInstance, container);
  initializeContainer(container);
  Container.get(ComponentBootstrap).run(CARD_NUMBER_IFRAME, CardNumber);
})();
