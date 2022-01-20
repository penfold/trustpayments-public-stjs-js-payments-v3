import { Service } from 'typedi';
import { IStyle } from '../../shared/model/config/IStyle';
import {
  ANIMATED_CARD_COMPONENT,
  CARD_NUMBER_COMPONENT,
  CONTROL_FRAME_COMPONENT,
  EXPIRATION_DATE_COMPONENT,
  SECURITY_CODE_COMPONENT,
  CLICK_TO_PAY_FRAME_COMPONENT,
  CLICK_TO_PAY_COMPONENT_NAME,
  ANIMATED_CARD_COMPONENT_NAME,
  CONTROL_FRAME_COMPONENT_NAME,
  SECURITY_CODE_COMPONENT_NAME,
  EXPIRATION_DATE_COMPONENT_NAME,
  CARD_NUMBER_COMPONENT_NAME,
} from '../../application/core/models/constants/Selectors';
import { IframeFactoryAttributes } from './IframeFactoryAttributes';

@Service()
export class IframeFactory {
  private static URLS = new Map(
    Object.entries({
      [CARD_NUMBER_COMPONENT_NAME]: CARD_NUMBER_COMPONENT,
      [EXPIRATION_DATE_COMPONENT_NAME]: EXPIRATION_DATE_COMPONENT,
      [SECURITY_CODE_COMPONENT_NAME]: SECURITY_CODE_COMPONENT,
      [ANIMATED_CARD_COMPONENT_NAME]: ANIMATED_CARD_COMPONENT,
      [CONTROL_FRAME_COMPONENT_NAME]: CONTROL_FRAME_COMPONENT,
      [CLICK_TO_PAY_COMPONENT_NAME]: CLICK_TO_PAY_FRAME_COMPONENT,
    })
  );

  create(
    name: string,
    id: string,
    styles?: IStyle,
    params?: Record<string, string>,
    tabIndex?: number
  ): HTMLIFrameElement {
    const componentParams = new URLSearchParams(params).toString();
    const componentStyles = new URLSearchParams(styles).toString();
    const componentAddress = IframeFactory.URLS.get(name);
    const iframe = document.createElement('iframe');
    const src = `${componentAddress}?${componentStyles}${componentParams ? '&' + componentParams : ''}`;

    const attributes: IframeFactoryAttributes = {
      id,
      class: id,
      src,
      name: id,
      allowTransparency: true,
      scrolling: 'no',
      frameBorder: 0,
      tabIndex,
    };

    // @ts-ignore
    Object.keys(attributes).forEach((value: string) => iframe.setAttribute(value, attributes[value]));
    return iframe;
  }
}
