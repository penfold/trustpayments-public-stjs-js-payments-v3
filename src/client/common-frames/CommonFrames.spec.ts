import { CommonFrames } from './CommonFrames';
import { instance as mockInstance, mock, when } from 'ts-mockito';
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
  const JWT =
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhbTAzMTAuYXV0b2FwaSIsImlhdCI6MTU3NjQ5MjA1NS44NjY1OSwicGF5bG9hZCI6eyJiYXNlYW1vdW50IjoiMTAwMCIsImFjY291bnR0eXBlZGVzY3JpcHRpb24iOiJFQ09NIiwiY3VycmVuY3lpc28zYSI6IkdCUCIsInNpdGVyZWZlcmVuY2UiOiJ0ZXN0X2phbWVzMzg2NDEiLCJsb2NhbGUiOiJlbl9HQiIsInBhbiI6IjMwODk1MDAwMDAwMDAwMDAwMjEiLCJleHBpcnlkYXRlIjoiMDEvMjIifX0.lbNSlaDkbzG6dkm1uc83cc3XvUImysNj_7fkdo___fw';
  let commonFrames: CommonFrames;
  const configProvider: ConfigProvider = mock<ConfigProvider>();
  const frame: Frame = mock(Frame);
  const iframeFactory: IframeFactory = mock(IframeFactory);
  const jwtDecoder: JwtDecoder = mock(JwtDecoder);
  const localStorage: BrowserLocalStorage = mock(BrowserLocalStorage);
  const messageBus: IMessageBus = new SimpleMessageBus();

  beforeEach(() => {
    when(configProvider.getConfig$()).thenReturn(of({ jwt: JWT } as IConfig));
    commonFrames = new CommonFrames(
      mockInstance(configProvider),
      mockInstance(frame),
      mockInstance(iframeFactory),
      mockInstance(jwtDecoder),
      mockInstance(localStorage),
      messageBus
    );
  });

  it('should init control frame component', () => {});

  it('should init merchant inputs listeners', () => {});

  it('should init transactionComplete listener', () => {});
});
