import Card from '@trustpayments/js-payments-card';
import { Container } from 'typedi';
import '../../core/shared/override-domain/OverrideDomain';
import { ComponentBootstrap } from '../../core/component-bootstrap/ComponentBootstrap';
import { ANIMATED_CARD_COMPONENT_IFRAME } from '../../core/models/constants/Selectors';
import { initializeContainer } from '../../dependency-injection/ServiceDefinitions';
import { AnimatedCard } from './AnimatedCard';

(() => {
  if(Card && document.URL.includes('animated')) {
    const container = Container.of(undefined);

    initializeContainer(container);
    container.get(ComponentBootstrap).run(ANIMATED_CARD_COMPONENT_IFRAME, AnimatedCard);
  }
})();
