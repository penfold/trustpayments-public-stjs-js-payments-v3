import '@securetrading/js-payments-card/stcardstyle.css';
import Card from '@securetrading/js-payments-card/stcard';
import { Container } from 'typedi';
import '../../core/shared/override-domain/OverrideDomain';
import { ComponentBootstrap } from '../../core/component-bootstrap/ComponentBootstrap';
import { AnimatedCard } from './AnimatedCard';
import { ANIMATED_CARD_COMPONENT_IFRAME } from '../../core/models/constants/Selectors';

(() => {
  if (Card && document.URL.includes('animated')) {
    Container.get(ComponentBootstrap).run(ANIMATED_CARD_COMPONENT_IFRAME, AnimatedCard);
  }
})();
