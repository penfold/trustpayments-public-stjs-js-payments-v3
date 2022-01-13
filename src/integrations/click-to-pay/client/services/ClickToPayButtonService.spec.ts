import { IClickToPayConfig } from '../../models/IClickToPayConfig';
import { ClickToPayButtonService } from './ClickToPayButtonService';

describe('ClickToPayButtonService', () => {
  const clickToPayButtonService: ClickToPayButtonService = new ClickToPayButtonService();
  const config: IClickToPayConfig = {
    buttonPlacement: 'st-click-to-pay',
  }
  const emptyConfig: IClickToPayConfig = {}

  const removeAllButtons = () => {
    const buttons = document.getElementsByTagName('img');
    for (let i = buttons.length - 1; i >= 0; i--) {
      buttons[0].parentNode.removeChild(buttons[0]);
    }
  };

  beforeEach(() => {
    const element: HTMLElement = document.createElement('div');
    element.setAttribute('id', 'st-click-to-pay');
    document.getElementsByTagName('body')[0].appendChild(element);
  });

  afterEach(() => {
    removeAllButtons();
  });

  it('should create correct markup and insert button into merchants page', () => {
    clickToPayButtonService.insertClickToPayButton(config);

    expect(document.getElementsByTagName('img').length).toEqual(1);
  });

  it('should return null if button has been previously inserted', () => {
    clickToPayButtonService.insertClickToPayButton(config);
    clickToPayButtonService.insertClickToPayButton(config);

    expect(clickToPayButtonService.insertClickToPayButton(config)).toEqual(null);
  });

  it('should set default button values of label and style if nothing has been specified', () => {
    clickToPayButtonService.insertClickToPayButton(emptyConfig);
    expect(document.getElementsByTagName('img').length).toEqual(1);
  });
});
