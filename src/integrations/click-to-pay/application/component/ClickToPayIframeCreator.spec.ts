import { anyString, anything, instance, mock, when } from 'ts-mockito';
import { IClickToPayConfig } from '../../models/IClickToPayConfig';
import { IframeFactory } from '../../../../client/iframe-factory/IframeFactory';
import { DomMethods } from '../../../../application/core/shared/dom-methods/DomMethods';
import { ClickToPayIframeCreator } from './ClickToPayIframeCreator';

describe('ClickToPayIframeCreator', () => {
  let sut: ClickToPayIframeCreator;
  let iframeFactory: IframeFactory;

  beforeEach(() => {
    iframeFactory = mock<IframeFactory>();
    DomMethods.appendChildStrictIntoDOM = jest.fn();

    when(iframeFactory.create(anyString(), anyString(), anything(), anything())).thenCall(
      (name: string, id: string) => {
        const iframe: HTMLIFrameElement = document.createElement('iframe');
        iframe.setAttribute('name', name);
        iframe.setAttribute('id', id);
        return iframe;
      }
    );
    sut = new ClickToPayIframeCreator(instance(iframeFactory));
  });

  describe('appendIframe()', () => {
    it('should append iframe', () => {
      const testConfig: IClickToPayConfig = { placement: anyString() };

      sut.appendIframe(testConfig);
      expect(DomMethods.appendChildStrictIntoDOM).toBeCalled();

    });
  });
});
