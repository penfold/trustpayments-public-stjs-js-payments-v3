import { Service } from 'typedi';
import { CLICK_TO_PAY_COMPONENT_NAME } from '../../../../application/core/models/constants/Selectors';
import { IClickToPayConfig } from '../../models/IClickToPayConfig';
import { DomMethods } from '../../../../application/core/shared/dom-methods/DomMethods';
import { IframeFactory } from '../../../../client/iframe-factory/IframeFactory';

@Service()
export class ClickToPayIframeCreator {
  constructor(private iframeFactory: IframeFactory) {
  }

  appendIframe(config: IClickToPayConfig): void {
    const clickToPayIframe: HTMLIFrameElement = this.iframeFactory.create(
      CLICK_TO_PAY_COMPONENT_NAME,
      config.placement
    );
    DomMethods.appendChildStrictIntoDOM(config.placement, clickToPayIframe)
  }
}
