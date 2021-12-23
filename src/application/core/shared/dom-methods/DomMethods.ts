import { fromEvent, Observable, of } from 'rxjs';
import { first, mapTo } from 'rxjs/operators';
import { IScriptParams } from '../../models/IScriptParams';

export class DomMethods {
  private static BODY_MARKUP = 'body';
  private static HIDDEN_ATTRIBUTE = 'hidden';
  private static INPUT_MARKUP = 'input';
  private static SCRIPT_MARKUP = 'script';
  private static SELECT_MARKUP = 'select';
  private static SRC_ATTRIBUTE = 'src';
  private static ST_NAME_ATTRIBUTE = 'data-st-name';
  private static STYLE_MARKUP = 'style';
  private static CREATED_FIELD_CLASSNAME = '-st-created-field';

  static addDataToForm(form: HTMLFormElement, data: Record<string, unknown>, fields?: string[]): void {
    Object.entries(data).forEach(([field, value]) => {
      if (!fields || fields.includes(field)) {
        let inputElement: HTMLInputElement = form.querySelector(`${DomMethods.INPUT_MARKUP}[name="${field}"]`);

        if (inputElement) {
          inputElement.value = value ? value.toString() : '';
        } else {
          inputElement = DomMethods.createHtmlElement(
            {
              name: field,
              type: DomMethods.HIDDEN_ATTRIBUTE,
              class: DomMethods.CREATED_FIELD_CLASSNAME,
              value: value ? value.toString() : '',
            },
            DomMethods.INPUT_MARKUP
          ) as HTMLInputElement;
        }

        form.appendChild(inputElement);
      }
    });
  }

  static addListener(targetId: string, listenerType: string, callback: (...args: unknown[]) => void): void {
    document.getElementById(targetId).addEventListener(listenerType, callback);
  }

  static appendChildIntoDOM(target: string, child: HTMLElement): Element {
    const element: Element = document.getElementById(target)
      ? document.getElementById(target)
      : document.getElementsByTagName(DomMethods.BODY_MARKUP)[0];
    element.appendChild(child);
    return element;
  }

  static appendChildStrictIntoDOM(target: string, child: HTMLElement): Element {
    const element: Element = document.getElementById(target);
    try {
      element.appendChild(child);
      return element;
    } catch (e) {
      console.error(`Cannot find target element ${target}.`);
      throw e;
    }
  }

  static createHtmlElement = (attributes: Record<string, string>, markup: string): HTMLElement => {
    const element: HTMLElement = document.createElement(markup);
    Object.keys(attributes).forEach(item => element.setAttribute(item, attributes[item]));
    return element;
  };

  static getAllFormElements = (form: HTMLElement): (HTMLSelectElement | HTMLInputElement)[] => [
    ...Array.from(form.querySelectorAll<HTMLSelectElement>(DomMethods.SELECT_MARKUP)),
    ...Array.from(form.querySelectorAll<HTMLInputElement>(DomMethods.INPUT_MARKUP)),
  ];

  static insertScript(target: string, params: IScriptParams): Observable<HTMLScriptElement> {
    const loaded: HTMLScriptElement = DomMethods.isScriptLoaded(params);

    if (loaded) {
      return of(loaded).pipe(first())
    }

    let targetElement: Element = document.getElementsByTagName(target)[0];
    if (!targetElement) {
      targetElement = document.getElementById(target);
    }
    // @ts-expect-error TypeScript doesn't allow you to assign known interfaces to dictionaries
    const script: HTMLScriptElement = DomMethods.setMarkupAttributes(DomMethods.SCRIPT_MARKUP, params);
    targetElement.appendChild(script);

    return fromEvent(script, 'load')
      .pipe(
        mapTo(script),
        first(),
      )
  }

  static insertStyle(contents: string[] | string): void {
    let style: HTMLStyleElement = document.getElementById('insertedStyles') as HTMLStyleElement;

    if (!style && contents.length > 0) {
      style = document.createElement(DomMethods.STYLE_MARKUP) as HTMLStyleElement;
      style.setAttribute('id', 'insertedStyles');
      style.setAttribute('type', 'text/css');
      document.head.appendChild(style);
    }

    if (typeof contents === 'string') {
      if (!style.innerHTML.includes(contents)) {
        style.innerHTML = style.innerHTML + contents;
      }
    } else {
      contents.forEach((item: string) => (style.sheet as CSSStyleSheet).insertRule(item, 0));
    }
  }

  static parseForm(formId: string): Record<string, unknown> {
    const form: HTMLElement = document.getElementById(formId);
    const els = DomMethods.getAllFormElements(form);
    const result: Record<string, unknown> = {};
    for (const el of els) {
      if (el.hasAttribute(DomMethods.ST_NAME_ATTRIBUTE)) {
        result[el.getAttribute(DomMethods.ST_NAME_ATTRIBUTE)] = el.value;
      }
    }
    return result;
  }

  static removeAllChildren(placement: string): HTMLElement {
    const element: HTMLElement = document.getElementById(placement);
    if (!element) {
      return element;
    }
    while (element.lastChild) {
      element.removeChild(element.lastChild);
    }
    return element;
  }

  static removeAllCreatedFields(form: HTMLFormElement): void {
    form.querySelectorAll(`.${DomMethods.CREATED_FIELD_CLASSNAME}`).forEach(element => element.remove());
  }

  static redirect(url: string): void {
    window.location.href = url;
  }

  static getAllIframes(): HTMLIFrameElement[] {
    return Array.from(document.getElementsByTagName('iframe'));
  }

  private static isScriptLoaded(params: IScriptParams): HTMLScriptElement | null {
    const { src, id } = params;
    const scriptBySrc: HTMLScriptElement | null = document.querySelector<HTMLScriptElement>(`${DomMethods.SCRIPT_MARKUP}[${DomMethods.SRC_ATTRIBUTE}="${src}"]`);
    const scriptById: HTMLScriptElement | null = document.getElementById(id) as HTMLScriptElement;
    return scriptById || scriptBySrc;
  }

  private static setMarkupAttributes(target: string, params: Record<string, string>): HTMLElement {
    const element: HTMLElement = document.createElement(target);
    Object.keys(params).forEach((param: string) => {
      element.setAttribute(param, params[param]);
    });
    return element;
  }
}
