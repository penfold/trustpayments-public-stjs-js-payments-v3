import { IClickToPayConfig } from '../../models/IClickToPayConfig';
import { ClickToPayButtonService } from './ClickToPayButtonService';

describe('ClickToPayButtonService', () => {
  const clickToPayButtonService: ClickToPayButtonService = new ClickToPayButtonService();
  const config: IClickToPayConfig = {
    buttonPlacement: 'st-click-to-pay',
  }
  const emptyConfig: IClickToPayConfig = {}

  beforeEach(() => {
    const element: HTMLElement = document.createElement('div');
    element.setAttribute('id', 'st-click-to-pay');
    document.body.appendChild(element);
  });

  afterEach(() => {
    const image = document.getElementById('st-click-to-pay');
    image.parentNode.removeChild(image);
  });

  it('should create correct markup and insert button into merchants page', () => {
    clickToPayButtonService.insertClickToPayButton(config);

    expect(document.getElementsByTagName('img').length).toEqual(1);
  });

  it('should return null if button has been previously inserted', () => {
    clickToPayButtonService.insertClickToPayButton(config);
    clickToPayButtonService.insertClickToPayButton(config);

    expect(document.getElementsByTagName('img').length).toEqual(1);
  });

  it('should set default button values of label and style if nothing has been specified', () => {
    clickToPayButtonService.insertClickToPayButton(emptyConfig);
    expect(document.getElementsByTagName('img').length).toEqual(1);
  });
});
