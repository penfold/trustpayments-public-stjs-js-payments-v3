import { instance, mock, objectContaining, verify, when } from 'ts-mockito';
import { SrcName } from '../digital-terminal/SrcName';
import { DigitalTerminal } from '../digital-terminal/DigitalTerminal';
import { ISrcProfileList } from '../digital-terminal/ISrc';
import { ITranslator } from '../../../application/core/shared/translator/ITranslator';
import { Translator } from '../../../application/core/shared/translator/Translator';
import { HPPUpdateViewCallback } from '../adapter/hpp-adapter/HPPUpdateViewCallback';
import { SrcNameFinder } from '../digital-terminal/SrcNameFinder';
import { IUpdateView } from '../adapter/interfaces/IUpdateView';
import { CardListGenerator } from './CardListGenerator';
import { cardListMock } from './card-list-mock';
import { NewCardFieldName } from './NewCardFieldName';

describe('CardListGenerator', () => {
  let cardListGenerator: CardListGenerator;
  let digitalTerminal: DigitalTerminal;
  let translator: ITranslator;
  let hppUpdateViewCallback: HPPUpdateViewCallback;
  let srcNameFinderMock: SrcNameFinder;

  beforeEach(() => {
    digitalTerminal = mock(DigitalTerminal);
    translator = mock(Translator);
    hppUpdateViewCallback = mock(HPPUpdateViewCallback);
    srcNameFinderMock = mock(SrcNameFinder);
    when(translator.translate('Hello')).thenReturn('Hello');
    when(translator.translate('Not you?')).thenReturn('Not you?');
    cardListGenerator = new CardListGenerator(instance(digitalTerminal), instance(translator), instance(srcNameFinderMock), instance(hppUpdateViewCallback));
  });

  it('generates html for single checked active card', () => {
    const expected = `
      <span class="st-card__checkbox"><label><input id="radio001" name="srcDigitalCardId" class="st-card__checkbox-input" type="radio" value="001" checked><span class="st-card__checkbox-radio"></span></label></span>
      <span class="st-card__image">
        <img src="card001Url" alt="" style="width: 60px; height: 40px">
      </span>
      <span class="st-card__description">
        VISA<br>
        ..6263
      </span>
      <span class="st-card__logo">
        <img src="test-file-stub" alt="">
      </span>
      <span class="st-card__type">
        <img src="test-file-stub" alt="">
      </span>
    `;

    const result = cardListGenerator['cardContent'](cardListMock[0], true);
    expect(result).toBe(expected);

  });

  it('generates html for single unchecked active card', () => {
    const expected = `
      <span class="st-card__checkbox"><label><input id="radio001" name="srcDigitalCardId" class="st-card__checkbox-input" type="radio" value="001"><span class="st-card__checkbox-radio"></span></label></span>
      <span class="st-card__image">
        <img src="card001Url" alt="" style="width: 60px; height: 40px">
      </span>
      <span class="st-card__description">
        VISA<br>
        ..6263
      </span>
      <span class="st-card__logo">
        <img src="test-file-stub" alt="">
      </span>
      <span class="st-card__type">
        <img src="test-file-stub" alt="">
      </span>
    `;

    const result = cardListGenerator['cardContent'](cardListMock[0]);
    expect(result).toBe(expected);

  });

  it('generates html for single inactive card', () => {
    const expected = `
      <span class="st-card__checkbox"></span>
      <span class="st-card__image">
        <img src="card002Url" alt="" style="width: 60px; height: 40px">
      </span>
      <span class="st-card__description">
        VISA<br>
        ..1345
      </span>
      <span class="st-card__logo">
        <img src="test-file-stub" alt="">
      </span>
      <span class="st-card__type">
        <img src="test-file-stub" alt="">
      </span>
    `;

    const result = cardListGenerator['cardContent'](cardListMock[1]);
    expect(result).toBe(expected);

  });

  it('generates html for user details', () => {
    const containerId = 'test-id';
    const userInformation = {
      VISA: {
        profiles: [{
          maskedConsumer: {
            emailAddress: 's*****@test.com',
          },
        }],
      },
    };
    const expected = `<body><div id="test-id"><div>
      <div id="st-ctp-welcome" class="st-ctp-welcome">
        <span>Welcome back to</span>
        <span class="st-ctp-welcome__logo">
          <img src="test-file-stub" alt="">
        </span>
        <span>Click To Pay</span>
        <span class="st-ctp-welcome__info-icon" id="st-ctp-welcome__info-icon">ⓘ</span>
      <div>
    <div class="st-tooltip" id="st-tooltip">
      <div style="justify-content: flex-end">
        <span class="st-tooltip__close-button" id="st-tooltip__close-button">×</span>
      </div>
      <div style="justify-content: center">
        <div>
          <span class="st-ctp-welcome__logo"><img src="test-file-stub" alt=""></span>Click to Pay
        </div>
      </div>
      <div style="font-size: 12px; font-weight: bold; justify-content: center; margin-bottom: 12px">Pay with confidence with trusted brands</div>
      <div><span class="st-ctp-welcome__logo"><img alt="" src="test-file-stub"></span><div style="display: block">For an easy and smart checkout, simply click to pay whenever you see the Click to Pay icon <img class="st-tooltip__logo" src="test-file-stub" alt="">, and your card is accepted.</div></div>
      <div><span class="st-ctp-welcome__logo"><img alt="" src="test-file-stub"></span>You can choose to be remembered on your device and browser for faster checkout.</div>
      <div><span class="st-ctp-welcome__logo"><img alt="" src="test-file-stub"></span>Built on industry standards for online transactions and supported by global payment brands.</div>
    </div>
    </div></div>
      <div id="st-ctp-user-details__wrapper" class="st-ctp-user-details__wrapper">
        <!--?xml version="1.0" encoding="UTF-8"?-->
        <svg class="st-ctp-user-details__image" enable-background="new 0 0 258.75 258.75" version="1.1" viewBox="0 0 258.75 258.75" xml:space="preserve" xmlns="http://www.w3.org/2000/svg">
          <circle cx="129.38" cy="60" r="60"></circle>
          <path d="m129.38 150c-60.061 0-108.75 48.689-108.75 108.75h217.5c0-60.061-48.689-108.75-108.75-108.75z"></path>
        </svg>
        <p class="st-ctp-user-details__information">Hello s*****@test.com <span id="st-ctp-user-details__not--you" class="st-ctp-user-details__not--you">Not you?</span></p>
      </div>
    </div></div></body>`;
    document.body.innerHTML = '<div id="test-id"></div>';

    cardListGenerator.displayUserInformation(containerId, userInformation as Partial<Record<SrcName, ISrcProfileList>>);
    expect(document.body.outerHTML).toBe(expected);
  });

  describe('openNewCardForm()', () => {
    const containerId = 'test-id';
    beforeEach(() => {
      document.body.innerHTML = '<form id="formId"><div id="test-id"></div></form>';
      cardListGenerator.displayCards('formId', containerId, cardListMock);
    });

    it('should clear selected card id', () => {
      cardListGenerator.openNewCardForm();
      expect(Array.from(document.getElementsByName('srcDigitalCardId')).some((element: HTMLInputElement) => element.checked)).toBe(false);
    });

    it('should call updateViewCallback', () => {
      cardListGenerator.openNewCardForm();
      verify(hppUpdateViewCallback.callUpdateViewCallback(objectContaining({
        displayMaskedCardNumber: null,
        displayCardType: null,
        displayCardForm: false,
        displaySubmitButton: true,
      } as IUpdateView))).once();
    });
  });

  describe('reset()', () => {
    let panField:HTMLInputElement;
    let cvvField:HTMLInputElement;
    let expiryYearField:HTMLInputElement;
    let expiryMonthField:HTMLInputElement;

    beforeEach(() => {
      document.body.innerHTML = '<form id="formId"><div id="test-id"></div></form>';
      cardListGenerator.displayCards('formId', 'test-id', cardListMock);

        panField = document.querySelector(`[name="${NewCardFieldName.pan}"]`);
        expiryYearField = document.querySelector(`[name="${NewCardFieldName.expiryYear}"]`);
        expiryMonthField = document.querySelector(`[name="${NewCardFieldName.expiryMonth}"]`);
        cvvField = document.querySelector(`[name="${NewCardFieldName.securityCode}"]`);
    });

    it('should clear new card form', () => {
      panField.value = 'random value'
      expiryYearField.value = '2040';
      expiryMonthField.value = '12';
      cvvField.value = '123';

      cardListGenerator.reset();
      expect(panField.value).toEqual('');
      expect(cvvField.value).toEqual('');
      expect(expiryMonthField.value).toEqual('');
      expect(expiryYearField.value).toEqual('');
    });
  });
});
