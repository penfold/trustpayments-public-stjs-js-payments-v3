import { anything, deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { Observable } from 'rxjs';
import { ISrcProvider } from './ISrcProvider';
import { SrcAggregate } from './SrcAggregate';
import { DcfActionCode, ICheckoutData, ICheckoutResponse, IConsumerIdentity, ISrc } from './ISrc';
import { SrcName } from './SrcName';
import { CardAggregator } from './CardAggregator';
import { ICorrelatedMaskedCard } from './interfaces/ICorrelatedMaskedCard';

describe('SrcAggregate', () => {
  let srcProviderMock1: ISrcProvider;
  let srcProviderMock2: ISrcProvider;
  let srcMock1: ISrc;
  let srcMock2: ISrc;
  let cardAggregatorMock: CardAggregator;
  let srcAggregate: SrcAggregate;

  const initData = {
    srciTransactionId: '12345',
    srcInitiatorId: '23456',
    dpaTransactionOptions: {},
  };

  beforeEach(() => {
    srcProviderMock1 = mock<ISrcProvider>();
    srcProviderMock2 = mock<ISrcProvider>();
    srcMock1 = mock<ISrc>();
    srcMock2 = mock<ISrc>();
    cardAggregatorMock = mock(CardAggregator);
    srcAggregate = new SrcAggregate(
      [
        instance(srcProviderMock1),
        instance(srcProviderMock2),
      ],
      instance(cardAggregatorMock)
    );

    const toObservable = <T>(value: T) => new Observable<T>(observer => {
      observer.next(value);
      observer.complete();
    });

    when(srcProviderMock1.getSrcName()).thenReturn('foo' as SrcName);
    when(srcProviderMock1.getSrc()).thenReturn(toObservable(instance(srcMock1)));
    when(srcProviderMock2.getSrcName()).thenReturn('bar' as SrcName);
    when(srcProviderMock2.getSrc()).thenReturn(toObservable(instance(srcMock2)));
    when(srcMock1.init(anything())).thenResolve(undefined);
    when(srcMock2.init(anything())).thenResolve(undefined);
  });

  describe('init()', () => {
    it('calls init() on all of SRCs', done => {
      srcAggregate.init(initData).subscribe(() => {
        verify(srcMock1.init(initData)).once();
        verify(srcMock2.init(initData)).once();
        done();
      });
    });
  });

  describe('isRecognized()', () => {
    const idToken1 = 'aaaaa';
    const idToken2 = 'bbbbb';

    beforeEach(() => {
      srcAggregate.init(initData);
    });

    it('returns true if at least one SRC recognizes the user', done => {
      when(srcMock1.isRecognized()).thenResolve({ recognized: true, idTokens: [idToken1] });
      when(srcMock2.isRecognized()).thenResolve({ recognized: false });

      srcAggregate.isRecognized().subscribe(result => {
        expect(result).toEqual({ recognized: true, idTokens: [idToken1] });
        done();
      });
    });

    it('returns idTokens collected from all SRC systems', done => {
      when(srcMock1.isRecognized()).thenResolve({ recognized: true, idTokens: [idToken1] });
      when(srcMock2.isRecognized()).thenResolve({ recognized: true, idTokens: [idToken2] });

      srcAggregate.isRecognized().subscribe(result => {
        expect(result).toEqual({ recognized: true, idTokens: [idToken1, idToken2] });
        done();
      });
    });

    it('returns false if none of SRC systems recognize the user', done => {
      when(srcMock1.isRecognized()).thenResolve({ recognized: false });
      when(srcMock2.isRecognized()).thenResolve({ recognized: false });

      srcAggregate.isRecognized().subscribe(result => {
        expect(result).toEqual({ recognized: false, idTokens: [] });
        done();
      });
    });
  });

  describe('getSrcProfile()', () => {
    const idTokens = ['idtoken'];

    beforeEach(() => {
      srcAggregate.init(initData);
    });

    it('returns profiles collected from all SRC and aggregated cards', done => {
      const profile1 = {
        srcCorrelationId: 'correlationid1',
        profiles: [],
      };
      const profile2 = {
        srcCorrelationId: 'correlationid2',
        profiles: [],
      };
      const cards = [
        { srcDigitalCardId: '111' } as ICorrelatedMaskedCard,
        { srcDigitalCardId: '222' } as ICorrelatedMaskedCard,
      ];

      when(srcMock1.getSrcProfile(idTokens)).thenResolve(profile1);
      when(srcMock2.getSrcProfile(idTokens)).thenResolve(profile2);
      when(cardAggregatorMock.aggregate(deepEqual({
        ['foo' as SrcName]: profile1,
        ['bar' as SrcName]: profile2,
      }))).thenReturn(cards);

      srcAggregate.getSrcProfile(idTokens).subscribe(result => {
        expect(result).toEqual({
          srcProfiles: {
            ['foo' as SrcName]: profile1,
            ['bar' as SrcName]: profile2,
          },
          aggregatedCards: cards,
        });
        done();
      });
    });
  });

  describe('identityLookup()', () => {
    const identity: IConsumerIdentity = {
      type: 'EMAIL',
      identityValue: 'user@trustpayments.net',
    };

    beforeEach(() => {
      srcAggregate.init(initData);
    });

    it('returns consumerPresent=false when user email is not present in any of SRCs', done => {
      when(srcMock1.identityLookup(identity)).thenResolve({ consumerPresent: false });
      when(srcMock2.identityLookup(identity)).thenResolve({ consumerPresent: false });

      srcAggregate.identityLookup(identity).subscribe(result => {
        expect(result).toEqual({
          consumerPresent: false,
          srcNames: [],
        });
        done();
      });
    });

    it('returns consumerPresent=true and list of SRCs where user email is present', done => {
      when(srcMock1.identityLookup(identity)).thenResolve({ consumerPresent: true });
      when(srcMock2.identityLookup(identity)).thenResolve({ consumerPresent: true });

      srcAggregate.identityLookup(identity).subscribe(result => {
        expect(result).toEqual({
          consumerPresent: true,
          srcNames: ['foo', 'bar'],
        });
        done();
      });
    });
  });

  describe('initiateIdentityValidation()', () => {
    beforeEach(() => {
      srcAggregate.init(initData);
    });

    it('calls initiateIdentityValidation() on selected SRC', done => {
      const response = { maskedValidationChannel: '***@***.net' };

      when(srcMock1.initiateIdentityValidation(undefined)).thenResolve(response);

      srcAggregate.initiateIdentityValidation('foo' as SrcName).subscribe(result => {
        expect(result).toBe(response);
        done();
      });
    });
  });

  describe('completeIdentityValidation()', () => {
    beforeEach(() => {
      srcAggregate.init(initData);
    });

    it('calls completeIdentityValidation() on selected SRC', done => {
      const response = { idToken: 'idtoken' };

      when(srcMock1.completeIdentityValidation('123456')).thenResolve(response);

      srcAggregate.completeIdentityValidation('foo' as SrcName, '123456').subscribe(result => {
        expect(result).toBe(response);
        done();
      });
    });
  });

  describe('checkout()', () => {
    beforeEach(() => {
      srcAggregate.init(initData);
    });

    it('calls checkout() on selected SRC', done => {
      const checkoutData: ICheckoutData = {
        srcCorrelationId: '',
      };

      const response: ICheckoutResponse = {
        checkoutResponse: 'checkout response',
        dcfActionCode: DcfActionCode.complete,
        unbindAppInstance: false,
        idToken: 'some token',
      };

      when(srcMock1.checkout(checkoutData)).thenResolve(response);

      srcAggregate.checkout('foo' as SrcName, checkoutData).subscribe(result => {
        expect(result).toBe(response);
        done();
      });
    });
  });

  describe('unbindAppInstance()', () => {
    beforeEach(() => {
      srcAggregate.init(initData);
    });

    it('calls unbindAppInstance() on all SRCs', done => {
      when(srcMock1.unbindAppInstance()).thenResolve(undefined);
      when(srcMock2.unbindAppInstance()).thenResolve(undefined);

      srcAggregate.unbindAppInstance().subscribe(() => {
        verify(srcMock1.unbindAppInstance()).once();
        verify(srcMock2.unbindAppInstance()).once();
        done();
      });
    });
  });
});
