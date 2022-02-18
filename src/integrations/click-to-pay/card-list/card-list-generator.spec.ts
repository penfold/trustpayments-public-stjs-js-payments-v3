import { instance as mockInstance, mock, when } from 'ts-mockito';
import { IconMap, mapIcon } from '../../../application/core/services/icon/IconMap';
import { CardListGenerator } from './card-list-generator';
import { cardListMock } from './card-list-mock';

describe('CardListGenerator', () => {

  const iconMap: IconMap = mock(IconMap);
  Object.keys(mapIcon).map(item => {
    when(iconMap.getUrl(item)).thenReturn(mapIcon[item]);
  });

  let cardListGenerator: CardListGenerator;

  beforeEach(() => {
    cardListGenerator = new CardListGenerator(mockInstance(iconMap));
  });

  it('generates html for single active card', () => {
    const expected = `
      <span class="cards__card__checkbox">
        <span style='display: none'><input type="radio" name="card" value="001" id="radio001"></span><img name="tick" id="tick001" src="images/empty.png" alt="">
      </span>
      <span class="cards__card__image">
        <img src="card001Url" alt="" style="width: 60px; height: 40px">
      </span>
      <span class="cards__card__description">
        VISA<br>
        ..6263
      </span>
      <span class="cards__card__logo">
        <img src="images/click-to-pay.png" alt="">
      </span>
      <span class="cards__card__type">
        <img src="./images/visa.png" alt="">
      </span>
    `;

    const result = cardListGenerator['cardContent'](cardListMock[0]);
    expect(result).toBe(expected);

  });

  it('generates html for single inactive card', () => {
    const expected = `
      <span class="cards__card__checkbox">
        <span style='display: none'></span>
      </span>
      <span class="cards__card__image">
        <img src="card002Url" alt="" style="width: 60px; height: 40px">
      </span>
      <span class="cards__card__description">
        VISA<br>
        ..1345
      </span>
      <span class="cards__card__logo">
        <img src="images/click-to-pay.png" alt="">
      </span>
      <span class="cards__card__type">
        <img src="./images/visa.png" alt="">
      </span>
    `;

    const result = cardListGenerator['cardContent'](cardListMock[1]);
    expect(result).toBe(expected);

  });
});
