import { VisaCheckoutButtonService } from './VisaCheckoutButtonService';
import { environment } from '../../../../environments/environment';
import { IVisaButtonSettings } from './IVisaButtonSettings';
import { IVisaButtonProps } from './IVisaButtonProps';

describe('VisaCheckoutButtonService', () => {
  let instance: VisaCheckoutButtonService;
  const customizedProperties: IVisaButtonSettings = {
    size: 154,
    height: 34,
    width: 100,
    locale: 'de_DE',
    color: 'neutral',
    cardBrands: 'MASTERCARD, VISA',
    acceptCanadianVisaDebit: 'true',
    cobrand: 'true'
  };

  const customizedPropertiesWithEmptyProp: IVisaButtonSettings = {
    ...customizedProperties,
    locale: ''
  };

  const customizedButton: IVisaButtonProps = {
    alt: 'Visa Checkout',
    class: 'v-button',
    id: 'v-button',
    role: 'button',
    src:
      'http://example.com/?size=154&height=34&width=100&locale=de_DE&color=neutral&cardBrands=MASTERCARD%2C+VISA&acceptCanadianVisaDebit=true&cobrand=true'
  };

  const customizedButtonWithEmptyProp: IVisaButtonProps = {
    ...customizedButton,
    src:
      'http://example.com/?size=154&height=34&width=100&color=neutral&cardBrands=MASTERCARD%2C+VISA&acceptCanadianVisaDebit=true&cobrand=true'
  };

  const customUrl: string = 'http://example.com/';
  const visaId: string = 'v-button';
  const divId: string = 'visa-checkout-test-container';

  beforeEach(() => {
    instance = new VisaCheckoutButtonService();
  });

  afterEach(() => {
    instance = null;
    document.getElementsByTagName('body')[0].textContent = '';
  });

  function createWrapperContainer() {
    const wrapperContainer: HTMLElement = document.createElement('div');
    wrapperContainer.setAttribute('id', divId);
    document.getElementsByTagName('body')[0].appendChild(wrapperContainer);
  }

  function prepareMountedElement(divId: string) {
    const mountedElement: Element = instance.mount(
      divId,
      customizedProperties,
      environment.VISA_CHECKOUT_URLS.TEST_SDK
    );
    const image = mountedElement.getElementsByTagName('img')[0];
    const div = mountedElement.getAttribute('id');
    return { div, image, mountedElement };
  }

  it(`should return ready to mount Visa Checkout button wrapped into element with id ${divId} specified in parameter`, () => {
    createWrapperContainer();
    const { div, image } = prepareMountedElement(divId);
    expect(image.getAttribute('id')).toEqual(visaId);
    expect(div).toEqual(divId);
  });

  it(`should return ready to mount Visa Checkout button injected directly into body element when id ${divId} is not specified`, () => {
    const { image, mountedElement } = prepareMountedElement(undefined);
    expect(image.getAttribute('id')).toEqual(visaId);
    expect(mountedElement.childNodes.length).toEqual(1);
    expect(mountedElement.tagName).toEqual('BODY');
  });

  it('should customize button with given values and return all defined properties', () => {
    expect(instance.customize(customizedProperties, customUrl)).toEqual(customizedButton);
  });

  it('should customize button with given values, omit empty properties and return all defined properties', () => {
    expect(instance.customize(customizedPropertiesWithEmptyProp, customUrl)).toEqual(customizedButtonWithEmptyProp);
  });
});
