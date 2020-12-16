import { Payment } from './Payment';
import { StTransport } from '../../services/st-transport/StTransport.class';
import { Container } from 'typedi';
import { Cybertonica } from '../../integrations/cybertonica/Cybertonica';
import { mock, instance as mockInstance, when, verify, spy } from 'ts-mockito';
import { ICard } from '../../models/ICard';
import { ConfigProvider } from '../../../../shared/services/config-provider/ConfigProvider';
import { TestConfigProvider } from '../../../../testing/mocks/TestConfigProvider';
import { StoreBasedStorage } from '../../../../shared/services/storage/StoreBasedStorage';
import { SimpleStorage } from '../../../../shared/services/storage/SimpleStorage';
import { IWallet } from '../../models/IWallet';
import { IWalletVerify } from '../../models/IWalletVerify';
import { IThreeDQueryResponse } from '../../models/IThreeDQueryResponse';
import { StCodec } from '../../services/st-codec/StCodec.class';
import { NotificationService } from '../../../../client/notification/NotificationService';
import { PAYMENT_SUCCESS } from '../../models/constants/Translations';
import { CustomerOutput } from '../../models/constants/CustomerOutput';

Container.set({ id: ConfigProvider, type: TestConfigProvider });

jest.mock('./../notification/Notification');

Container.set({ id: StoreBasedStorage, type: SimpleStorage });

describe('Payment', () => {
  let card: ICard;
  let wallet: IWallet;
  let walletVerify: IWalletVerify;
  let notificationService: NotificationService;
  let cybertonica: Cybertonica;
  let instance: Payment;

  beforeEach(() => {
    const fixture = paymentFixture();
    card = fixture.card;
    wallet = fixture.wallet;
    walletVerify = fixture.walletverify;
    notificationService = fixture.notificationService;
    cybertonica = fixture.cybertonicaMock;
    instance = fixture.instance;
  });

  describe('constructor()', () => {
    beforeEach(() => {
      // @ts-ignore
      instance._stTransport.sendRequest = jest.fn();
    });

    it('should set attributes to payment instance', () => {
      // @ts-ignore
      expect(instance._stTransport).toBeInstanceOf(StTransport);
    });
  });

  describe('processPayment()', () => {
    beforeEach(() => {
      // @ts-ignore
      instance._stTransport.sendRequest = jest.fn();
    });

    it('should send remaining request types with card and merchant data', async () => {
      await instance.processPayment(['AUTH'], card, {
        merchant: 'data'
      });
      // @ts-ignore
      expect(instance._stTransport.sendRequest).toHaveBeenCalledWith({
        ...card,
        merchant: 'data'
      });
    });

    it('should send remaining request types with cybertonica tid', async () => {
      const cybertonicaTid = 'b268ab7f-25d7-430a-9be2-82b0f00c4039';

      when(cybertonica.getTransactionId()).thenResolve(cybertonicaTid);

      await instance.processPayment(['AUTH'], card, {
        merchant: 'data'
      });

      // @ts-ignore
      expect(instance._stTransport.sendRequest).toHaveBeenCalledWith({
        ...card,
        merchant: 'data',
        fraudcontroltransactionid: cybertonicaTid
      });
    });

    it('should send remaining request types with 3D response', async () => {
      await instance.processPayment(['AUTH', 'RISKDEC'], card, { pan: 'overridden', merchant: 'data' }, ({
        requesttypescription: 'THREEDQUERY',
        customeroutput: CustomerOutput.THREEDREDIRECT,
        cachetoken: 'foobar',
        errorcode: '0',
        threedresponse: 'xyzzzz'
      } as unknown) as IThreeDQueryResponse);
      // @ts-ignore
      expect(instance._stTransport.sendRequest).toHaveBeenCalledWith({
        ...card,
        merchant: 'data',
        cachetoken: 'foobar',
        threedresponse: 'xyzzzz'
      });
    });

    it('should not send remaining request types when previous response has RESULT customeroutput ', async () => {
      await instance.processPayment(['AUTH', 'RISKDEC'], card, { pan: 'overridden', merchant: 'data' }, ({
        requesttypescription: 'THREEDQUERY',
        customeroutput: CustomerOutput.RESULT,
        cachetoken: 'foobar',
        threedresponse: 'xyzzzz',
        errorcode: '0'
      } as unknown) as IThreeDQueryResponse);

      // @ts-ignore
      expect(instance._stTransport.sendRequest).not.toHaveBeenCalled();
    });

    it('should not send remaining request types when previous response has TRYAGAIN customeroutput ', done => {
      instance
        .processPayment(['AUTH', 'RISKDEC'], card, { pan: 'overridden', merchant: 'data' }, ({
          requesttypescription: 'THREEDQUERY',
          customeroutput: CustomerOutput.TRYAGAIN,
          cachetoken: 'foobar',
          threedresponse: 'xyzzzz',
          errorcode: '0'
        } as unknown) as IThreeDQueryResponse)
        .catch(() => {
          // @ts-ignore
          expect(instance._stTransport.sendRequest).not.toHaveBeenCalled();
          done();
        });
    });

    it('should not send remaining request types when previous response has no-zero errorcode', done => {
      instance
        .processPayment(['AUTH', 'RISKDEC'], card, { pan: 'overridden', merchant: 'data' }, ({
          requesttypescription: 'THREEDQUERY',
          customeroutput: CustomerOutput.THREEDREDIRECT,
          cachetoken: 'foobar',
          threedresponse: 'xyzzzz',
          errorcode: '1234'
        } as unknown) as IThreeDQueryResponse)
        .catch(() => {
          // @ts-ignore
          expect(instance._stTransport.sendRequest).not.toHaveBeenCalled();
          done();
        });
    });

    it('should send AUTH request with wallet', async () => {
      await instance.processPayment(['AUTH'], wallet, {
        merchant: 'data'
      });
      // @ts-ignore
      expect(instance._stTransport.sendRequest).toHaveBeenCalledWith({
        walletsource: 'APPLEPAY',
        wallettoken: 'encryptedpaymentdata',
        merchant: 'data'
      });
    });

    it('should send AUTH request with wallet and additional data', async () => {
      await instance.processPayment(['AUTH'], wallet, {
        wallettoken: 'overridden',
        merchant: 'data'
      });
      // @ts-ignore
      expect(instance._stTransport.sendRequest).toHaveBeenCalledWith({
        walletsource: 'APPLEPAY',
        wallettoken: 'encryptedpaymentdata',
        merchant: 'data'
      });
    });

    it('should send CACHETOKENISE request with wallet and additional data', async () => {
      await instance.processPayment(['CACHETOKENISE'], wallet, {
        wallettoken: 'overridden',
        merchant: 'data'
      });
      // @ts-ignore
      expect(instance._stTransport.sendRequest).toHaveBeenCalledWith({
        walletsource: 'APPLEPAY',
        wallettoken: 'encryptedpaymentdata',
        merchant: 'data'
      });
    });

    it('should publish the response when TDQ is the last request type and there is threedresponse', async () => {
      const response: IThreeDQueryResponse = ({
        requesttypedescription: 'THREEDQUERY',
        threedresponse: 'foobar',
        jwt: 'jwt'
      } as unknown) as IThreeDQueryResponse;

      const stCodecSpy = spy(StCodec);

      const result = await instance.processPayment([], {} as ICard, {}, response);

      expect((result as any).response).toBe(response);
      verify(stCodecSpy.publishResponse(response, 'jwt', 'foobar')).once();
      verify(notificationService.success(PAYMENT_SUCCESS)).once();
    });

    it('should not publish response if last request type is not TDQ', async () => {
      const response: IThreeDQueryResponse = ({
        requesttypedescription: 'RISKDEC',
        jwt: 'jwt'
      } as unknown) as IThreeDQueryResponse;

      const stCodecSpy = spy(StCodec);

      const result = await instance.processPayment([], {} as ICard, {}, response);

      expect((result as any).response).toBe(response);
      verify(stCodecSpy.publishResponse(response, 'jwt', 'foobar')).never();
      verify(notificationService.success(PAYMENT_SUCCESS)).never();
    });

    it('should not publish response if last request type is TDQ but there is no threedresponse', async () => {
      const response: IThreeDQueryResponse = ({
        requesttypedescription: 'THREEDQUERY',
        jwt: 'jwt'
      } as unknown) as IThreeDQueryResponse;

      const stCodecSpy = spy(StCodec);

      const result = await instance.processPayment([], {} as ICard, {}, response);

      expect((result as any).response).toBe(response);
      verify(stCodecSpy.publishResponse(response, 'jwt', 'foobar')).never();
      verify(notificationService.success(PAYMENT_SUCCESS)).never();
    });
  });

  describe('walletVerify()', () => {
    it('should send WALLETVERIFY request with walletverify', done => {
      const walletVerifyResponseMock = {};
      // @ts-ignore
      instance._stTransport.sendRequest = jest
        .fn()
        .mockImplementationOnce(() => Promise.resolve(walletVerifyResponseMock));

      instance.walletVerify(walletVerify).subscribe(value => {
        // @ts-ignore
        expect(instance._stTransport.sendRequest).toHaveBeenCalledWith({
          requesttypedescriptions: ['WALLETVERIFY'],
          walletsource: 'APPLEPAY',
          walletmerchantid: '123456789',
          walletvalidationurl: 'https://example.com',
          walletrequestdomain: 'https://example2.com'
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
  let instance: Payment;
  const cachetoken = 'somecachetoken';
  const cybertonicaMock = mock(Cybertonica);
  const notificationService = mock(NotificationService);
  when(cybertonicaMock.getTransactionId()).thenResolve(undefined);
  Container.set(Cybertonica, mockInstance(cybertonicaMock));
  Container.set(NotificationService, mockInstance(notificationService));
  instance = new Payment();
  const card = {
    expirydate: '10/22',
    pan: '4111111111111111',
    securitycode: '123'
  };
  const wallet = {
    walletsource: 'APPLEPAY',
    wallettoken: 'encryptedpaymentdata'
  };
  const walletverify = {
    walletsource: 'APPLEPAY',
    walletmerchantid: '123456789',
    walletvalidationurl: 'https://example.com',
    walletrequestdomain: 'https://example2.com'
  };
  return { card, wallet, walletverify, instance, jwt, cachetoken, notificationService, cybertonicaMock };
}
