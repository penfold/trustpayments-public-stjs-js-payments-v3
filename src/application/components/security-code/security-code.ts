import './security-code.scss';
import '../../core/shared/override-domain/OverrideDomain';
import { Container } from 'typedi';
import { ComponentBootstrap } from '../../core/component-bootstrap/ComponentBootstrap';
import { SECURITY_CODE_IFRAME } from '../../core/models/constants/Selectors';
import { SecurityCode } from './SecurityCode';

(() => {
  Container.get(ComponentBootstrap).run(SECURITY_CODE_IFRAME, SecurityCode);
})();
