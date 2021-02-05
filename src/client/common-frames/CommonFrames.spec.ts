import { CommonFrames } from './CommonFrames';
import { anyString, anything, instance as mockInstance, mock, when } from 'ts-mockito';
import { of } from 'rxjs';
import { IConfig } from '../../shared/model/config/IConfig';
import { ConfigProvider } from '../../shared/services/config-provider/ConfigProvider';
import { Frame } from '../../application/core/shared/frame/Frame';
import { IframeFactory } from '../iframe-factory/IframeFactory';
import { JwtDecoder } from '../../shared/services/jwt-decoder/JwtDecoder';
import { BrowserLocalStorage } from '../../shared/services/storage/BrowserLocalStorage';
import { IMessageBus } from '../../application/core/shared/message-bus/IMessageBus';
import { SimpleMessageBus } from '../../application/core/shared/message-bus/SimpleMessageBus';

describe('CommonFrames', () => {
  const form = document.createElement('form');
  form.setAttribute('id', 'st-form');
  document.body.appendChild(form);
  const jwt =
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhbTAzMTAuYXV0b2FwaSIsImlhdCI6MTU3NjQ5MjA1NS44NjY1OSwicGF5bG9hZCI6eyJiYXNlYW1vdW50IjoiMTAwMCIsImFjY291bnR0eXBlZGVzY3JpcHRpb24iOiJFQ09NIiwiY3VycmVuY3lpc28zYSI6IkdCUCIsInNpdGVyZWZlcmVuY2UiOiJ0ZXN0X2phbWVzMzg2NDEiLCJsb2NhbGUiOiJlbl9HQiIsInBhbiI6IjMwODk1MDAwMDAwMDAwMDAwMjEiLCJleHBpcnlkYXRlIjoiMDEvMjIifX0.lbNSlaDkbzG6dkm1uc83cc3XvUImysNj_7fkdo___fw';
  let commonFrames: CommonFrames;
  let configProvider: ConfigProvider;
  let frame: Frame;
  let iframeFactory: IframeFactory;
  let jwtDecoder: JwtDecoder;
  let localStorage: BrowserLocalStorage;
  let messageBus: IMessageBus;

  beforeEach(() => {
    configProvider = mock<ConfigProvider>();
    frame = mock(Frame);
    iframeFactory = mock(IframeFactory);
    jwtDecoder = mock(JwtDecoder);
    localStorage = mock(BrowserLocalStorage);
    messageBus = new SimpleMessageBus();

    when(configProvider.getConfig$()).thenReturn(
      of({
        jwt: jwt,
        formId: 'st-form',
        datacenterurl: 'test',
        origin: 'testorigin',
        styles: { controlFrame: {} }
      } as IConfig)
    );

    when(iframeFactory.create(anyString(), anyString())).thenCall((name: string, id: string) => {
      const iframe: HTMLIFrameElement = document.createElement('iframe');
      iframe.setAttribute('name', name);
      iframe.setAttribute('id', id);
      return iframe;
    });

    when(frame.parseUrl()).thenReturn({ params: { locale: 'en_GB' } });

    commonFrames = new CommonFrames(
      mockInstance(configProvider),
      mockInstance(frame),
      mockInstance(iframeFactory),
      mockInstance(jwtDecoder),
      mockInstance(localStorage),
      messageBus
    );
    //commonFrames.init();
  });

  it('should init control frame component', () => {});

  it('should init merchant inputs listeners', () => {});

  it('should init transactionComplete listener', () => {});

  it('should call submit process and cancel data in url', () => {});

  it('should call submit process and error data in url', () => {});

  it('should call submit process and success data in url', () => {});

  it('should quit completing transaction if requesttypedescription is equal WALLETVERIFY or JSINIT', () => {});

  it('should quit completing transaction if errorcode is not equal 0', () => {});
});
