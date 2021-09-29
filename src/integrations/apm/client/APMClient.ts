import { Service } from 'typedi';
import { IConfig } from '../../../shared/model/config/IConfig';
import { Observable, of } from 'rxjs';
import { DomMethods } from '../../../application/core/shared/dom-methods/DomMethods';
import { getAPMListFromConfig } from '../models/APMUtils';
import { IAPMConfig } from '../models/IAPMConfig';
import { IAPMItemConfig } from '../models/IAPMItemConfig';
import { APMName } from '../models/APMName';

@Service()
export class APMClient {
  init(config: IConfig): Observable<unknown> {
    this.insertAPMButtons(config.apm);

    return of(null);
  }

  private insertAPMButtons(config: IAPMConfig) {
    const apmList = getAPMListFromConfig(config);

    apmList.forEach((apmItemConfig: IAPMItemConfig) => {
      this.insertAPMButton(config.placement, apmItemConfig);
    });
  }

  private insertAPMButton(apmButtonPlacement: string, apmItemConfig: IAPMItemConfig) {
    DomMethods.appendChildStrictIntoDOM(apmButtonPlacement, this.createButtonForApmItem(apmItemConfig));
  }

  private createButtonForApmItem(apmItemConfig: IAPMItemConfig): HTMLElement {
    const button = DomMethods.createHtmlElement({ type: 'button' }, 'button');

    // TODO add styling and image assets ???
    button.innerText = `${apmItemConfig.name}`;
    button.addEventListener('click', () => this.onAPMButtonClick(apmItemConfig.name));

    return button;
  }

  private onAPMButtonClick(name: APMName) {
    console.log(`${name} payment button clicked`); // TODO start payement here

    return undefined;
  }
}
