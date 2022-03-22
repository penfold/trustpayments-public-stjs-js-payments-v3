import { instance, mock, when } from 'ts-mockito';
import { SrcName } from '../digital-terminal/SrcName';
import { DigitalTerminal } from '../digital-terminal/DigitalTerminal';
import { ISrcProfileList } from '../digital-terminal/ISrc';
import { ITranslator } from '../../../application/core/shared/translator/ITranslator';
import { Translator } from '../../../application/core/shared/translator/Translator';
import { SrcNameFinder } from '../digital-terminal/SrcNameFinder';
import { CardListGenerator } from './CardListGenerator';
import { cardListMock } from './card-list-mock';

describe('CardListGenerator', () => {
  let cardListGenerator: CardListGenerator;
  let digitalTerminal: DigitalTerminal;
  let translator: ITranslator;
  let srcNameFinderMock: SrcNameFinder;

  beforeEach(() => {
    digitalTerminal = mock(DigitalTerminal);
    translator = mock(Translator);
    srcNameFinderMock = mock(SrcNameFinder);
    when(translator.translate('Hello')).thenReturn('Hello');
    when(translator.translate('Not you?')).thenReturn('Not you?');
    cardListGenerator = new CardListGenerator(instance(digitalTerminal), instance(translator), instance(srcNameFinderMock));
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
});
