import { VisaCheckoutButtonService } from './VisaCheckoutButtonService';
import { environment } from '../../../../environments/environment';

describe('VisaCheckoutButtonService', () => {
  let instance: VisaCheckoutButtonService;

  beforeEach(() => {
    instance = new VisaCheckoutButtonService();
  });

  it('should mount button to html', () => {
    instance.mount('test-button', { size: 154, height: 34 }, environment.VISA_CHECKOUT_URLS.TEST_SDK);
    expect(document.getElementById('test-button')).toEqual(null);
  });
});
