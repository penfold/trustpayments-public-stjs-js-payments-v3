import './expiration-date.scss';
import '../../core/shared/override-domain/OverrideDomain';
import { Container } from 'typedi';
import { ComponentBootstrap } from '../../core/component-bootstrap/ComponentBootstrap';
import { EXPIRATION_DATE_IFRAME } from '../../core/models/constants/Selectors';
import { ExpirationDate } from './ExpirationDate';

(() => {
  Container.get(ComponentBootstrap).run(EXPIRATION_DATE_IFRAME, ExpirationDate);
})();
