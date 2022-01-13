import { instance, mock, verify } from 'ts-mockito';
import { IClickToPayConfig } from '../models/IClickToPayConfig';
import { ClickToPayClient } from './ClickToPayClient';
import { ClickToPayButtonService } from './services/ClickToPayButtonService';

describe('ClickToPayClient', () => {
  let clickToPayClient: ClickToPayClient;
  let clickToPayButtonServiceMock: ClickToPayButtonService;
  const config: IClickToPayConfig = {
    buttonPlacement: 'st-click-to-pay',
  }

  beforeEach(() => {
    clickToPayButtonServiceMock = mock(ClickToPayButtonService);
    clickToPayClient = new ClickToPayClient(
      instance(clickToPayButtonServiceMock),
    );
  });

  describe('init()', () => {
    it('resolves the Click to Pay config and inserts the pay button', done => {
      clickToPayClient.init(config);
      verify(clickToPayButtonServiceMock.insertClickToPayButton(config)).once();
      done();
    });
  });
});
