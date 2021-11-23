import { DisabledFraudControlDataProvider } from './DisabledFraudControlDataProvider';

describe('DisabledFraudControlDataProvider', () => {
  const sut = new DisabledFraudControlDataProvider();

  it('is initializable', done => {
    sut.init().subscribe(result => {
      expect(result).toBeUndefined();
      done()
    });
  });

  it('returns null as transactionId', done => {
    sut.getTransactionId().subscribe(tid => {
      expect(tid).toBeNull();
      done();
    });
  });
});
