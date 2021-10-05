import { Service } from 'typedi';
import { Observable, of } from 'rxjs';
import { DomMethods } from '../../../application/core/shared/dom-methods/DomMethods';
import { IAPMItemConfig } from '../models/IAPMItemConfig';
import { IAPMConfig } from '../models/IAPMConfig';
import { APMConfigResolver } from '../services/apm-config-resolver/APMConfigResolver';
import { APMName } from '../models/APMName';
import './APMClient.scss';


@Service()
export class APMClient {
  private apmIcons: Record<APMName, string> = {
    [APMName.ZIP]: require('./images/zip.svg'),
  };

  constructor(private apmConfigResolver: APMConfigResolver) {
  }

  init(config: IAPMConfig): Observable<undefined> {
    this.apmConfigResolver.resolve(config).apmList.forEach(itemConfig => this.insertAPMButton(itemConfig as IAPMItemConfig));

    return of(undefined);
  }

  private insertAPMButton(apmItemConfig: IAPMItemConfig) {
    DomMethods.appendChildStrictIntoDOM(apmItemConfig.placement, this.createButtonForApmItem(apmItemConfig));
  }

  private createButtonForApmItem(apmItemConfig: IAPMItemConfig): HTMLElement {
    const button = DomMethods.createHtmlElement({ class: 'st-apm-button' }, 'div');
    if (this.apmIcons[apmItemConfig.name]) {
      button.innerHTML = `<img src='${this.apmIcons[apmItemConfig.name]}' alt='${apmItemConfig.name}' class='st-apm-button__img'>`;
    }
    button.addEventListener('click', (event) => this.onAPMButtonClick(event, apmItemConfig));

    return button;
  }

  private onAPMButtonClick(event: Event, { name }: IAPMItemConfig) {
    event.preventDefault();
    console.log(`${name} payment button clicked`); // TODO start payement here
  }
}
