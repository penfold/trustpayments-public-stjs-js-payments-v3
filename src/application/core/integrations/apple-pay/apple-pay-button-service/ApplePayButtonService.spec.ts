import { ApplePayButtonService } from './ApplePayButtonService';

describe('ApplePayButtonService', () => {
  const applePayButtonService: ApplePayButtonService = new ApplePayButtonService();

  beforeEach(() => {
    applePayButtonService.insertButton('some-id', 'apple pay button', 'normal', 'de_DE');
  });

  it('should create correct markup and insert button into merchants page', () => {
    expect(document.getElementsByTagName('a').length).toEqual(1);
    expect(document.getElementsByTagName('a')[0].lang).toEqual('de_DE');
    expect(document.getElementsByTagName('a')[0].style.pointerEvents).toEqual('auto');
    expect(document.getElementsByTagName('a')[0].style.cursor).toEqual('pointer');
    expect(document.getElementsByTagName('a')[0].style.display).toEqual('flex');
  });
});
