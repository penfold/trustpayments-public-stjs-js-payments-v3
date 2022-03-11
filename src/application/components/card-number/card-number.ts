import './card-number.scss';
import '../../core/shared/override-domain/OverrideDomain';
import { Container } from 'typedi';
import { ComponentBootstrap } from '../../core/component-bootstrap/ComponentBootstrap';
import { CARD_NUMBER_IFRAME } from '../../core/models/constants/Selectors';
import { initializeContainer } from '../../dependency-injection/ServiceDefinitions';
import { CardNumber } from './CardNumber';

(() => {
  const sessionID =  new URLSearchParams(window.location.search).get('sessionID');
  const container = Container.of(sessionID);
  initializeContainer(container);
  container.get(ComponentBootstrap).run(CARD_NUMBER_IFRAME, CardNumber);
})();
