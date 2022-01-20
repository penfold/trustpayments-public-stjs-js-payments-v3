import './click-to-pay.scss';
import '../../core/shared/override-domain/OverrideDomain';
import { Container } from 'typedi';
import { ComponentBootstrap } from '../../core/component-bootstrap/ComponentBootstrap';
import { CLICK_TO_PAY_IFRAME } from '../../core/models/constants/Selectors';
import { ClickToPay } from '../../../integrations/click-to-pay/application/component/ClickToPay';

(() => {
  Container.get(ComponentBootstrap).run(CLICK_TO_PAY_IFRAME, ClickToPay);
})();
