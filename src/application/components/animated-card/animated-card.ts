import Card from '@trustpayments/js-payments-card';
import { Container } from 'typedi';
import '../../core/shared/override-domain/OverrideDomain';
import { ComponentBootstrap } from '../../core/component-bootstrap/ComponentBootstrap';
import { ANIMATED_CARD_COMPONENT_IFRAME } from '../../core/models/constants/Selectors';
import { AnimatedCard } from './AnimatedCard';

(() => {
  if (Card && document.URL.includes('animated')) {
    Container.get(ComponentBootstrap).run(ANIMATED_CARD_COMPONENT_IFRAME, AnimatedCard);
  }
})();
