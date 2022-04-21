import './security-code-tokenized.scss';
import '../../core/shared/override-domain/OverrideDomain';
import { Container } from 'typedi';
import { ComponentBootstrap } from '../../core/component-bootstrap/ComponentBootstrap';
import { TOKENIZED_SECURITY_CODE_IFRAME } from '../../core/models/constants/SecurityCodeTokenized';
import { SecurityCodeTokenized } from './SecurityCodeTokenized';

(() => {
  Container.get(ComponentBootstrap).run(TOKENIZED_SECURITY_CODE_IFRAME, SecurityCodeTokenized);
})();
