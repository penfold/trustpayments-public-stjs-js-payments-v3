import './card-number.scss';
import '../../core/shared/override-domain/OverrideDomain';
import { Container } from 'typedi';
import { ComponentBootstrap } from '../../core/component-bootstrap/ComponentBootstrap';
import { CARD_NUMBER_IFRAME } from '../../core/models/constants/Selectors';
import { CardNumber } from './CardNumber';

(() => {
  Container.get(ComponentBootstrap).run(CARD_NUMBER_IFRAME, CardNumber);
})();
