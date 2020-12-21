import { IAllowedStyles } from '../../models/IAllowedStyles';
import { IGroupedStyles } from '../../models/IGroupedStyles';
import { IStyle } from '../../../../shared/model/config/IStyle';
import { ISubStyles } from '../../models/ISubStyles';
import { DomMethods } from '../dom-methods/DomMethods';
import { Container, Service } from 'typedi';
import { Frame } from '../frame/Frame';
import { IStyles } from '../../../../shared/model/config/IStyles';
import { forEach } from 'lodash';

interface StylesAttributes {
  elementId: string;
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
    // tslint:disable-next-line:forin
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
    const { elementId, classList, inlineStyles } = props;
    const element = document.getElementById(elementId);

    if (classList) {
      classList.forEach(className => element.classList.add(className));
    }

    if (inlineStyles && inlineStyles.length > 0) {
      inlineStyles.forEach(({ property, value }) => element.style.setProperty(property, value));
    }
  }

  private _filter(styles: IStyles[]): IStyle {
    const filtered: IStyle = {};
    // tslint:disable-next-line:forin
    styles.forEach((style: IStyle, index) => {
      const propName: string = Object.keys(style)[0];
      if (this._allowed.hasOwnProperty(propName)) {
        // @ts-ignore
        filtered[propName] = styles[index][propName];
      }
    });
    return filtered;
  }

  private _sanitize(styles: IStyle): IStyle {
    const sanitized: IStyle = {};
    // tslint:disable-next-line:forin
    for (const style in styles) {
      if (/^[A-Za-z0-9 _%#)(,.-]*[A-Za-z0-9][A-Za-z0-9 _%#)(,.-]*$/i.test(styles[style])) {
        sanitized[style] = styles[style];
      }
    }
    return sanitized;
  }

  private _group(styles: IStyle): IGroupedStyles {
    const grouped: IGroupedStyles = {};
    // tslint:disable-next-line:forin
    for (const style in styles) {
      const allowed = this._allowed[style];
      if (!grouped.hasOwnProperty(allowed.selector)) {
        grouped[allowed.selector] = {};
      }
      grouped[allowed.selector][allowed.property] = styles[style];
    }
    return grouped;
  }

  private _getStyleString(styles: IStyles[]): string[] {
    let groupedStyles: IGroupedStyles;
    let styled: IStyle;
    let tag: string;
    const templates: string[] = [`body { display: block; }`];
    styled = this._filter(styles);
    styled = this._sanitize(styled);
    groupedStyles = this._group(styled);
    // tslint:disable-next-line:forin
    for (tag in groupedStyles) {
      const tagStyle = Styler._getTagStyles(groupedStyles[tag]);
      templates.push(`${tag} { ${tagStyle} }`);
    }
    return templates;
  }
}
