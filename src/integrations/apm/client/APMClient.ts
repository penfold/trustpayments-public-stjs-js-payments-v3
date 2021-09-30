import { Service } from 'typedi';
import { Observable, of } from 'rxjs';
import { IConfig } from '../../../shared/model/config/IConfig';
import { DomMethods } from '../../../application/core/shared/dom-methods/DomMethods';
import { getAPMListFromConfig } from '../models/APMUtils';
import { IAPMItemConfig } from '../models/IAPMItemConfig';

@Service()
export class APMClient {
  init(config: IConfig): Observable<undefined> {
    getAPMListFromConfig(config.apm).forEach(itemConfig => this.insertAPMButton(itemConfig));

    return of(undefined);
  }

  private insertAPMButton(apmItemConfig: IAPMItemConfig) {
    DomMethods.appendChildStrictIntoDOM(apmItemConfig.placement, this.createButtonForApmItem(apmItemConfig));
  }

  private createButtonForApmItem(apmItemConfig: IAPMItemConfig): HTMLElement {
    const button = DomMethods.createHtmlElement({ type: 'button' }, 'button');

    // TODO add styling and image assets ???
    button.innerText = `${apmItemConfig.name}`;
    button.addEventListener('click', (event) => this.onAPMButtonClick(event, apmItemConfig));

    return button;
  }

  private onAPMButtonClick(event: Event, { name }: IAPMItemConfig) {
    event.preventDefault();
    console.log(`${name} payment button clicked`); // TODO start payement here
  }
}
