import { CardListGenerator } from './CardListGenerator';
import { cardListMock } from './card-list-mock';

describe('CardListGenerator', () => {
  let cardListGenerator: CardListGenerator;

  beforeEach(() => {
    cardListGenerator = new CardListGenerator();
  });

  it('generates html for single active card', () => {
    const expected = `
      <span class="st-card__checkbox"><label><input id="radio001" name="srcDigitalCardId" type="radio" value="001"><span class="radio"></span></label></span>
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
});
