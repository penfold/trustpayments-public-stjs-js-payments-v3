import { environment } from '../../../../../environments/environment';
import { VisaCheckoutButtonService } from './VisaCheckoutButtonService';
import { IVisaCheckoutButtonSettings } from './IVisaCheckoutButtonSettings';

describe('VisaCheckoutButtonService', () => {
  let instance: VisaCheckoutButtonService;
  const customizedProperties: IVisaCheckoutButtonSettings = {
    size: 154,
    height: 34,
    width: 100,
    locale: 'de_DE',
    color: 'neutral',
    cardBrands: 'MASTERCARD, VISA',
    acceptCanadianVisaDebit: 'true',
    cobrand: 'true',
  };
  const visaId = 'v-button';
  const divId = 'visa-checkout-test-container';

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
});
