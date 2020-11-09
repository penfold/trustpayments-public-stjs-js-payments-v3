import { VisaCheckoutButtonService } from './VisaCheckoutButtonService';
import { environment } from '../../../../environments/environment';

describe('VisaCheckoutButtonService', () => {
  let instance: VisaCheckoutButtonService;

  beforeEach(() => {
    instance = new VisaCheckoutButtonService();
  });

  it.skip('should mount button to html', () => {
    instance.mount('test-button', { size: 100, height: 34 }, environment.VISA_CHECKOUT_URLS.TEST_SDK);
    expect(document.getElementById('test-button')).toEqual('test');
  });
});
