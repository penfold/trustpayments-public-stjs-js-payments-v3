import { CardAggregator } from './CardAggregator';
import { SrcName } from './SrcName';
import { IMaskedCard, IMaskedConsumer, ISrcProfileList } from './ISrc';

describe('CardAggregator', () => {
  const cardDataTemplate: IMaskedCard = {
    srcDigitalCardId: '',
    panBin: '',
    panLastFour: 0,
    tokenBinRange: '',
    paymentAccountReference: '',
    tokenLastFour: 0,
    panExpirationMonth: 0,
    panExpirationYear: 0,
    digitalCardData: {
      status: 'ACTIVE',
      artHeight: 0,
      artUri: '',
      artWidth: 0,
    },
    dateOfCardCreated: '2022-03-04T12:05:26.947Z',
    dateOfCardLastUsed: '2022-03-05T12:05:26.947Z',
    dcf: {
      uri: '',
      logoUri: '',
      name: '',
    },
    maskedBillingAddress: {
      addressId: '',
      line1: '',
      line2: '',
      line3: '',
      city: '',
      state: '',
      zip: '',
      countryCode: '',
      createTime: '',
      lastUsedTime: 0,
    },
  };

  let cardAggregator: CardAggregator;

  beforeEach(() => {
    cardAggregator = new CardAggregator();
  });

  describe('aggregate()', () => {
    it('adds additional data to card objects', () => {
      const card1: IMaskedCard = {
        ...cardDataTemplate,
        panLastFour: 1111,
      };
      const card2: IMaskedCard = {
        ...cardDataTemplate,
        panLastFour: 2222,
        digitalCardData: {
          ...cardDataTemplate.digitalCardData,
          status: 'EXPIRED',
        },
      };

      const profiles: Partial<Record<SrcName, ISrcProfileList>> = {
        ['foo' as SrcName]: {
          srcCorrelationId: 'foocorrelationid',
          profiles: [
            {
              idToken: 'fooidtoken',
              maskedConsumer: {} as IMaskedConsumer,
              maskedCards: [card1],
            },
          ],
        },
        ['bar' as SrcName]: {
          srcCorrelationId: 'barcorrelationid',
          profiles: [
            {
              idToken: 'baridtoken',
              maskedConsumer: {} as IMaskedConsumer,
              maskedCards: [card2],
            },
          ],
        },
      }

      const result = cardAggregator.aggregate(profiles);

      expect(result.length).toBe(2);
      expect(result).toContainEqual({
        ...card1,
        srcCorrelationId: 'foocorrelationid',
        srcName: 'foo' as SrcName.VISA,
        idToken: 'fooidtoken',
        isActive: true,
      });
      expect(result).toContainEqual({
        ...card2,
        srcCorrelationId: 'barcorrelationid',
        srcName: 'bar' as SrcName.VISA,
        idToken: 'baridtoken',
        isActive: false,
      });
    });

    it('sorts cards by status, date used and date created', () => {
      const unsortedCards: IMaskedCard[] = [
        {
          ...cardDataTemplate,
          panLastFour: 1111,
          digitalCardData: {
            ...cardDataTemplate.digitalCardData,
            status: 'EXPIRED',
          },
        },
        {
          ...cardDataTemplate,
          panLastFour: 2222,
          dateOfCardCreated: '2022-03-06T12:05:26.947Z',
          dateOfCardLastUsed: '2022-03-07T12:05:26.947Z',
        },
        {
          ...cardDataTemplate,
          panLastFour: 3333,
          dateOfCardLastUsed: '2022-03-05T12:05:26.947Z',
          dateOfCardCreated: '2022-03-06T12:05:26.947Z',
        },
        {
          ...cardDataTemplate,
          panLastFour: 4444,
          dateOfCardCreated: '2022-03-07T12:05:26.947Z',
          dateOfCardLastUsed: '2022-03-08T12:05:26.947Z',
        },
        {
          ...cardDataTemplate,
          panLastFour: 5555,
          dateOfCardCreated: '2022-03-08T12:05:26.947Z',
          dateOfCardLastUsed: '2022-03-09T12:05:26.947Z',
        },
      ];
      const profiles: Partial<Record<SrcName, ISrcProfileList>> = {
        [SrcName.VISA]: {
          srcCorrelationId: 'correlationid',
          profiles: [
            {
              idToken: 'idtoken',
              maskedConsumer: {} as IMaskedConsumer,
              maskedCards: unsortedCards,
            },
          ],
        },
      };

      const result = cardAggregator.aggregate(profiles).map(card => card.panLastFour);

      expect(result).toEqual([5555, 4444, 2222, 3333, 1111]);
    });
  });
});
