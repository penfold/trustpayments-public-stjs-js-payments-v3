import { Service } from 'typedi';

@Service()
export class AllowedStylesService {
  getStyles(
    input: string,
    inputError: string,
    inputPlaceholder: string,
    message: string,
    label: string,
    icon?: string,
    wrapper?: string
  ) {
    return {
      'background-color-input': { property: 'background-color', selector: input },
      'background-color-input-error': { property: 'background-color', selector: inputError },
      'background-color-message': { property: 'background-color', selector: message },
      'background-color-label': { property: 'background-color', selector: label },
      'border-color-input': { property: 'border-color', selector: input },
      'border-color-input-error': { property: 'border-color', selector: inputError },
      'border-radius-input': { property: 'border-radius', selector: input },
      'border-radius-input-error': { property: 'border-radius', selector: inputError },
      'border-size-input': { property: 'border-width', selector: input },
      'border-size-input-error': { property: 'border-width', selector: inputError },
      'box-shadow-input': { property: 'box-shadow', selector: input },
      'color-error': { property: 'color', selector: message },
      'color-input': { property: 'color', selector: input },
      'color-input-error': { property: 'color', selector: inputError },
      'color-input-placeholder': { property: 'color', selector: inputPlaceholder },
      'color-label': { property: 'color', selector: label },
      'display-label': { property: 'display', selector: label },
      'font-size-input': { property: 'font-size', selector: input },
      'font-size-input-error': { property: 'font-size', selector: inputError },
      'font-size-label': { property: 'font-size', selector: label },
      'font-size-message': { property: 'font-size', selector: message },
      'font-family-input': { property: 'font-family', selector: input },
      'font-family-input-error': { property: 'font-family', selector: inputError },
      'font-family-label': { property: 'font-family', selector: label },
      'font-family-message': { property: 'font-family', selector: message },
      'line-height-input': { property: 'line-height', selector: input },
      'line-height-input-error': { property: 'line-height', selector: inputError },
      'line-height-label': { property: 'line-height', selector: label },
      'line-height-message': { property: 'line-height', selector: message },
      'max-width-label': { property: 'max-width', selector: label },
      'outline-input': { property: 'outline', selector: input },
      'space-inset-input': { property: 'padding', selector: input },
      'space-inset-input-error': { property: 'padding', selector: inputError },
      'space-inset-message': { property: 'padding', selector: message },
      'space-outset-input': { property: 'margin', selector: input },
      'space-outset-input-error': { property: 'margin', selector: inputError },
      'space-outset-message': { property: 'margin', selector: message },
      'position-top-icon': { property: 'top', selector: icon },
      'position-bottom-icon': { property: 'bottom', selector: icon },
      'position-right-icon': { property: 'right', selector: icon },
      'position-left-icon': { property: 'left', selector: icon },
      'position-top-label': { property: 'top', selector: label },
      'position-bottom-label': { property: 'bottom', selector: label },
      'position-right-label': { property: 'right', selector: label },
      'position-left-label': { property: 'left', selector: label },
      'width-label': { property: 'width', selector: label },
      'space-inset-wrapper': { property: 'padding', selector: wrapper }
    };
  }
}
