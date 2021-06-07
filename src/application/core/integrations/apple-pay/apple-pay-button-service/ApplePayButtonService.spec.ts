import { ApplePayButtonService } from './ApplePayButtonService';

describe('ApplePayButtonService', () => {
  const applePayButtonService: ApplePayButtonService = new ApplePayButtonService();

  const removeAllButtons = () => {
    const buttons = document.getElementsByTagName('a');
    for (let i = buttons.length - 1; i >= 0; i--) {
      buttons[0].parentNode.removeChild(buttons[0]);
    }
  };

  afterEach(() => {
    removeAllButtons();
  });

  it('should create correct markup and insert button into merchants page', () => {
    applePayButtonService.insertButton('some-id', 'apple pay button', 'normal', 'de_DE');

    expect(document.getElementsByTagName('a').length).toEqual(1);
    expect(document.getElementsByTagName('a')[0].lang).toEqual('de_DE');
    expect(document.getElementsByTagName('a')[0].style.pointerEvents).toEqual('auto');
    expect(document.getElementsByTagName('a')[0].style.cursor).toEqual('pointer');
    expect(document.getElementsByTagName('a')[0].style.display).toEqual('flex');
  });

  it('should return null if button has been previously inserted', () => {
    const element: HTMLElement = document.createElement('div');
    element.setAttribute('id', 'some-id');
    document.getElementsByTagName('body')[0].appendChild(element);
    applePayButtonService.insertButton('some-id', 'apple pay button', 'normal', 'de_DE');

    expect(applePayButtonService.insertButton('some-id', 'apple pay button', 'normal', 'de_DE')).toEqual(null);
  });

  it('should set default button values of label and style if nothing has been specified', () => {
    applePayButtonService.insertButton('some-id', null, null, 'en_GB');
    expect(document.getElementsByTagName('a').length).toEqual(1);
    expect(document.getElementsByTagName('a')[0].lang).toEqual('en_GB');
    expect(document.getElementsByTagName('a')[0].getAttribute('style')).toEqual(`-webkit-appearance: -apple-pay-button;
                -apple-pay-button-type: plain;
                -apple-pay-button-style: black;pointer-events: auto;cursor: pointer;display: flex;role: button;`);
  });
});
