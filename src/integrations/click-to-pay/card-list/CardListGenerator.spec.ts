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
  const testFormId = 'formId';
  const testContainerId = 'containerId';

  beforeEach(() => {
    digitalTerminal = mock(DigitalTerminal);
    translator = mock(Translator);
    hppUpdateViewCallback = mock(HPPUpdateViewCallback);
    srcNameFinderMock = mock(SrcNameFinder);
    when(translator.translate('Hello')).thenReturn('Hello');
    when(translator.translate('Not you?')).thenReturn('Not you?');
    cardListGenerator = new CardListGenerator(instance(digitalTerminal), instance(translator), instance(srcNameFinderMock), instance(hppUpdateViewCallback));
    document.body.innerHTML = `<form id="${testFormId}"><div id="${testContainerId}"></div></form>`;
  });

  describe('displayCardList()', () => {
    it('should render first card from list', () => {
      cardListGenerator.displayCards(testFormId, testContainerId, cardListMock);
      expect(document.querySelectorAll(`#${testFormId} .st-card:not(.st-card--hidden)`).length).toEqual(1);
      expect(document.querySelectorAll(`#${testFormId} .st-card.st-card--hidden`).length).toEqual(cardListMock.length - 1);
    });
  });

  describe('displayUserInformation()', () => {
    it('generates html for user details', () => {
      const userInformation = {
        VISA: {
          profiles: [{
            maskedConsumer: {
              emailAddress: 's*****@test.com',
            },
          }],
        },
      };
      cardListGenerator.displayUserInformation(testContainerId, userInformation as Partial<Record<SrcName, ISrcProfileList>>);
      expect((document.querySelector('.st-ctp-user-details__wrapper') as HTMLElement).innerHTML).toContain(`${userInformation.VISA.profiles[0].maskedConsumer.emailAddress}`);
    });
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
    let panField: HTMLInputElement;
    let cvvField: HTMLInputElement;
    let expiryYearField: HTMLInputElement;
    let expiryMonthField: HTMLInputElement;

    beforeEach(() => {
      document.body.innerHTML = '<form id="formId"><div id="test-id"></div></form>';
      cardListGenerator.displayCards('formId', 'test-id', cardListMock);

      panField = document.querySelector(`[name="${NewCardFieldName.pan}"]`);
      expiryYearField = document.querySelector(`[name="${NewCardFieldName.expiryYear}"]`);
      expiryMonthField = document.querySelector(`[name="${NewCardFieldName.expiryMonth}"]`);
      cvvField = document.querySelector(`[name="${NewCardFieldName.securityCode}"]`);
    });

    it('should clear new card form', () => {
      panField.value = 'random value';
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
