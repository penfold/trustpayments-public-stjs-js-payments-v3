import { IAllowedStyles } from '../../models/IAllowedStyles';
import { IGroupedStyles } from '../../models/IGroupedStyles';
import { IStyle } from '../../../../shared/model/config/IStyle';
import { ISubStyles } from '../../models/ISubStyles';
import { DomMethods } from '../dom-methods/DomMethods';
import { Container, Service } from 'typedi';
import { Frame } from '../frame/Frame';
import { IStyles } from '../../../../shared/model/config/IStyles';

interface StylesAttributes {
  elementSelector: string;
  classList?: string[];
  inlineStyles?: {
    property: string;
    value: string;
  }[];
}

@Service()
export class Styler {
  private static _getTagStyles(styles: ISubStyles): string {
    const results = [];
    for (const style in styles) {
      results.push(`${style}: ${styles[style]};`);
    }
    return results.join(' ');
  }

  private _frame: Frame;
  private readonly _allowed: IAllowedStyles;

  constructor(allowed: IAllowedStyles, styles: IStyles[]) {
    this._frame = Container.get(Frame);
    this._allowed = allowed;
    this.inject(styles);
  }

  public inject(styles: IStyles[]): void {
    DomMethods.insertStyle(this._getStyleString(styles));
  }

  public hasSpecificStyle(selectedStyle: string, styles: IStyle = {}): boolean {
    return Boolean(
      Object.entries(styles).find(([key, value]) => {
        return key === selectedStyle && value !== 'false';
      })
    );
  }

  public addStyles(styles: StylesAttributes[]): void {
    styles.forEach(style => this.addStylesToElement(style));
  }

  private addStylesToElement(props: StylesAttributes) {
    const { elementSelector, classList, inlineStyles } = props;
    const element = document.querySelector(elementSelector) as HTMLElement;

    if (classList) {
      classList.forEach(className => element.classList.add(className));
    }

    if (inlineStyles && inlineStyles.length > 0) {
      inlineStyles.forEach(({ property, value }) => element.style.setProperty(property, value));
    }
  }

  private _filter(styles: IStyles[]): IStyle {
    const filtered: IStyle = {};
    styles.forEach((style: IStyle, index) => {
      const propName: string = Object.keys(style)[0];
      if (Object.prototype.hasOwnProperty.call(this._allowed, propName)) {
        // @ts-ignore
        filtered[propName] = styles[index][propName];
      }
    });
    return filtered;
  }

  private _sanitize(styles: IStyle): IStyle {
    const sanitized: IStyle = {};
    for (const style in styles) {
      if (/^[A-Za-z0-9 _%#)(,.-]*[A-Za-z0-9][A-Za-z0-9 _%#)(,.-]*$/i.test(styles[style])) {
        sanitized[style] = styles[style];
      }
    }
    return sanitized;
  }

  private _group(styles: IStyle): IGroupedStyles {
    const grouped: IGroupedStyles = {};
    for (const style in styles) {
      const allowed = this._allowed[style];
      if (!Object.prototype.hasOwnProperty.call(grouped, allowed.selector)) {
        grouped[allowed.selector] = {};
      }
      grouped[allowed.selector][allowed.property] = styles[style];
    }
    return grouped;
  }

  private _getStyleString(styles: IStyles[]): string[] {
    const styled: IStyle = this._sanitize(this._filter(styles));
    const groupedStyles: IGroupedStyles = this._group(styled);
    let tag: string;
    const templates: string[] = ['body { display: block; }'];
    for (tag in groupedStyles) {
      const tagStyle = Styler._getTagStyles(groupedStyles[tag]);
      templates.push(`${tag} { ${tagStyle} }`);
    }
    return templates;
  }
}
