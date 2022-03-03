import { instance as mockInstance, mock, verify, when } from 'ts-mockito';
import { Container } from 'typedi';
import { of } from 'rxjs';
import { NotificationService } from '../../../../client/notification/NotificationService';
import { ConfigProvider } from '../../../../shared/services/config-provider/ConfigProvider';
import { SimpleStorage } from '../../../../shared/services/storage/SimpleStorage';
import { StoreBasedStorage } from '../../../../shared/services/storage/StoreBasedStorage';
import { RequestType } from '../../../../shared/types/RequestType';
import { TestConfigProvider } from '../../../../testing/mocks/TestConfigProvider';
import { CustomerOutput } from '../../models/constants/CustomerOutput';
import { PAYMENT_SUCCESS } from '../../models/constants/Translations';
import { ICard } from '../../models/ICard';
import { IThreeDQueryResponse } from '../../models/IThreeDQueryResponse';
import { IWallet } from '../../models/IWallet';
import { IWalletVerify } from '../../models/IWalletVerify';
import { StCodec } from '../../services/st-codec/StCodec';
import { StTransport } from '../../services/st-transport/StTransport';
import { TranslatorToken } from '../../../../shared/dependency-injection/InjectionTokens';
import { Translator } from '../translator/Translator';
import { ITranslationProvider } from '../translator/ITranslationProvider';
import { TranslationProvider } from '../translator/TranslationProvider';
import { FraudControlService } from '../../services/fraud-control/FraudControlService';
import { Payment } from './Payment';

Container.set({ id: ConfigProvider, type: TestConfigProvider });

jest.mock('./../notification/Notification');

Container.set({ id: StoreBasedStorage, type: SimpleStorage });
Container.set({ id: TranslatorToken, type: Translator });
Container.set({ id: ITranslationProvider, type: TranslationProvider });

describe('Payment', () => {
  let card: ICard;
  let wallet: IWallet;
  let walletVerify: IWalletVerify;
  let notificationService: NotificationService;
  let fraudControlService: FraudControlService;
  let instance: Payment;

  beforeEach(() => {
    const fixture = paymentFixture();
    card = fixture.card;
    wallet = fixture.wallet;
    walletVerify = fixture.walletverify;
    notificationService = fixture.notificationService;
    fraudControlService = fixture.fraudControlServiceMock;
    instance = fixture.instance;
  });

  describe('processPayment()', () => {
    beforeEach(() => {
      // @ts-ignore
      instance.stTransport.sendRequest = jest.fn();
    });

    it('should send remaining request types with card and merchant data', async () => {
      await instance.processPayment([RequestType.AUTH], card, {
        merchant: 'data',
      });
      // @ts-ignore
      expect(instance.stTransport.sendRequest).toHaveBeenCalledWith({
        ...card,
        merchant: 'data',
      }, undefined);
    });

    it('should send remaining request types with fraud control tid', async () => {
      const fraudControlTid = 'b268ab7f-25d7-430a-9be2-82b0f00c4039';

      when(fraudControlService.getTransactionId()).thenReturn(of(fraudControlTid));

      await instance.processPayment([RequestType.AUTH], card, {
        merchant: 'data',
      });

      // @ts-ignore
      expect(instance.stTransport.sendRequest).toHaveBeenCalledWith({
        ...card,
        merchant: 'data',
        fraudcontroltransactionid: fraudControlTid,
      }, undefined);
    });

    it('should send remaining request types with 3D response', async () => {
      await instance.processPayment(
        [RequestType.AUTH, RequestType.RISKDEC],
        card,
        { pan: 'overridden', merchant: 'data' },
        ({
          requesttypedescription: 'THREEDQUERY',
          customeroutput: CustomerOutput.THREEDREDIRECT,
          cachetoken: 'foobar',
          errorcode: '0',
          threedresponse: 'xyzzzz',
        } as unknown) as IThreeDQueryResponse,
      );
      // @ts-ignore
      expect(instance.stTransport.sendRequest).toHaveBeenCalledWith({
        ...card,
        merchant: 'data',
        cachetoken: 'foobar',
        threedresponse: 'xyzzzz',
      }, undefined);
    });

    it('should not send remaining request types when previous response has RESULT customeroutput', async () => {
      await instance.processPayment(
        [RequestType.AUTH, RequestType.RISKDEC],
        card,
        { pan: 'overridden', merchant: 'data' },
        ({
          requesttypedescription: 'THREEDQUERY',
          customeroutput: CustomerOutput.RESULT,
          cachetoken: 'foobar',
          threedresponse: 'xyzzzz',
          errorcode: '0',
        } as unknown) as IThreeDQueryResponse,
      );

      // @ts-ignore
      expect(instance.stTransport.sendRequest).not.toHaveBeenCalled();
    });

    it('should not send remaining request types when previous response has TRYAGAIN customeroutput', async () => {
      await expect(instance
        .processPayment([RequestType.AUTH, RequestType.RISKDEC], card, { pan: 'overridden', merchant: 'data' }, ({
          requesttypedescription: 'THREEDQUERY',
          customeroutput: CustomerOutput.TRYAGAIN,
          cachetoken: 'foobar',
          threedresponse: 'xyzzzz',
          errorcode: '0',
        } as unknown) as IThreeDQueryResponse)).rejects.toEqual({
        response: {
          requesttypedescription: 'THREEDQUERY',
          customeroutput: CustomerOutput.TRYAGAIN,
          cachetoken: 'foobar',
          threedresponse: 'xyzzzz',
          errorcode: '0',
        },
      });

      // @ts-ignore
      expect(instance.stTransport.sendRequest).not.toHaveBeenCalled();
    });

    it('should not send remaining request types when previous response has no-zero errorcode', async () => {
      await expect(instance
        .processPayment([RequestType.AUTH, RequestType.RISKDEC], card, { pan: 'overridden', merchant: 'data' }, ({
          requesttypedescription: 'THREEDQUERY',
          customeroutput: CustomerOutput.THREEDREDIRECT,
          cachetoken: 'foobar',
          threedresponse: 'xyzzzz',
          errorcode: '1234',
        } as unknown) as IThreeDQueryResponse)).rejects.toEqual({
        response: {
          requesttypedescription: 'THREEDQUERY',
          customeroutput: CustomerOutput.THREEDREDIRECT,
          cachetoken: 'foobar',
          threedresponse: 'xyzzzz',
          errorcode: '1234',
        },
      });

      // @ts-ignore
      expect(instance.stTransport.sendRequest).not.toHaveBeenCalled();
    });

    it('should send AUTH request with wallet', async () => {
      await instance.processPayment([RequestType.AUTH], wallet, {
        merchant: 'data',
      });
      // @ts-ignore
      expect(instance.stTransport.sendRequest).toHaveBeenCalledWith({
        walletsource: 'APPLEPAY',
        wallettoken: 'encryptedpaymentdata',
        merchant: 'data',
      }, undefined);
    });

    it('should send AUTH request with wallet and additional data', async () => {
      await instance.processPayment([RequestType.AUTH], wallet, {
        wallettoken: 'overridden',
        merchant: 'data',
      });
      // @ts-ignore
      expect(instance.stTransport.sendRequest).toHaveBeenCalledWith({
        walletsource: 'APPLEPAY',
        wallettoken: 'encryptedpaymentdata',
        merchant: 'data',
      }, undefined);
    });

    it('should send CACHETOKENISE request with wallet and additional data', async () => {
      await instance.processPayment([RequestType.CACHETOKENISE], wallet, {
        wallettoken: 'overridden',
        merchant: 'data',
      });
      // @ts-ignore
      expect(instance.stTransport.sendRequest).toHaveBeenCalledWith({
        walletsource: 'APPLEPAY',
        wallettoken: 'encryptedpaymentdata',
        merchant: 'data',
      }, undefined);
    });

    it('should publish the response when TDQ is the last request type and there is threedresponse', async () => {
      const response: IThreeDQueryResponse = ({
        requesttypedescription: 'THREEDQUERY',
        threedresponse: 'foobar',
        jwt: 'jwt',
      } as unknown) as IThreeDQueryResponse;

      const result = await instance.processPayment([], {} as ICard, {}, response);

      expect(result.response).toBe(response);
      verify(notificationService.success(PAYMENT_SUCCESS)).once();
    });

    it('should not publish response if last request type is not TDQ', async () => {
      const response: IThreeDQueryResponse = ({
        requesttypedescription: 'RISKDEC',
        jwt: 'jwt',
      } as unknown) as IThreeDQueryResponse;

      const result = await instance.processPayment([], {} as ICard, {}, response);

      expect(result.response).toBe(response);
      verify(notificationService.success(PAYMENT_SUCCESS)).never();
    });

    it('should not publish response if last request type is TDQ but there is no threedresponse', async () => {
      const response: IThreeDQueryResponse = ({
        requesttypedescription: 'THREEDQUERY',
        jwt: 'jwt',
      } as unknown) as IThreeDQueryResponse;

      const result = await instance.processPayment([], {} as ICard, {}, response);

      expect(result.response).toBe(response);
      verify(notificationService.success(PAYMENT_SUCCESS)).never();
    });

    it('should send a request with wallet param and merchantUrl', async () => {
      await instance.processPayment(
        [RequestType.AUTH],
        wallet,
        { wallettoken: 'overridden' },
        undefined,
        'https://somemerchanturl.com',
      );
      // @ts-ignore
      expect(instance.stTransport.sendRequest).toHaveBeenCalledWith({
        walletsource: 'APPLEPAY',
        wallettoken: 'encryptedpaymentdata',
      }, 'https://somemerchanturl.com');
    });
  });

  describe('walletVerify()', () => {
    it('should send WALLETVERIFY request with walletverify', done => {
      const walletVerifyResponseMock = {};
      // @ts-ignore
      instance.stTransport.sendRequest = jest
        .fn()
        .mockImplementationOnce(() => Promise.resolve(walletVerifyResponseMock));

      instance.walletVerify(walletVerify).subscribe(value => {
        // @ts-ignore
        expect(instance.stTransport.sendRequest).toHaveBeenCalledWith({
          requesttypedescriptions: ['WALLETVERIFY'],
          walletsource: 'APPLEPAY',
          walletmerchantid: '123456789',
          walletvalidationurl: 'https://example.com',
          walletrequestdomain: 'https://example2.com',
        });
        expect(value).toEqual(walletVerifyResponseMock);
        done();
      });
    });
  });
});

function paymentFixture() {
  const jwt =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ0ZXN0X2p3dF9pc3N1ZXIiLCJwYXlsb2FkIjp7InNpdGVyZWZlcmVuY2UiOiJleGFtcGxlMTIzNDUiLCJiYXNlYW1vdW50IjoiMTAwMCIsImN1cnJlbmN5aXNvM2EiOiJHQlAifSwiaWF0IjoxNTE2MjM5MDIyfQ.jPuLMHxK3fznVddzkRoYC94hgheBXI1Y7zHAr7qNCig';
  const cachetoken = 'somecachetoken';
  const fraudControlServiceMock = mock(FraudControlService);
  const notificationService = mock(NotificationService);
  const stTransport: StTransport = mock(StTransport);
  const stCodec: StCodec = mock(StCodec);

  when(fraudControlServiceMock.getTransactionId()).thenReturn(of(null));

  Container.set(FraudControlService, mockInstance(fraudControlServiceMock));
  Container.set(NotificationService, mockInstance(notificationService));

  const instance: Payment = new Payment(mockInstance(stTransport), mockInstance(fraudControlServiceMock), mockInstance(notificationService), mockInstance(stCodec));
  const card = {
    expirydate: '10/22',
    pan: '4111111111111111',
    securitycode: '123',
  };
  const wallet = {
    walletsource: 'APPLEPAY',
    wallettoken: 'encryptedpaymentdata',
  };
  const walletverify = {
    walletsource: 'APPLEPAY',
    walletmerchantid: '123456789',
    walletvalidationurl: 'https://example.com',
    walletrequestdomain: 'https://example2.com',
  };
  return { card, wallet, walletverify, instance, jwt, cachetoken, notificationService, fraudControlServiceMock };
}
