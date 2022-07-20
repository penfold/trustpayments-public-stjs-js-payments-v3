import { forkJoin } from 'rxjs';
import { SrcNameFinder } from './SrcNameFinder';
import { SrcName } from './SrcName';

describe('SrcNameFinder', () => {
  let srcNameFinder: SrcNameFinder;

  beforeEach(() => {
    srcNameFinder = new SrcNameFinder();
  });

  it('returns SrcName based on the partial pan number', done => {
    forkJoin([
      srcNameFinder.findSrcNameByPan('411111'),
      srcNameFinder.findSrcNameByPan('4111111111111111'),
      srcNameFinder.findSrcNameByPan('411'),
      srcNameFinder.findSrcNameByPan(''),
      srcNameFinder.findSrcNameByPan('555555'),
    ]).subscribe(result => {
      expect(result).toEqual([
        SrcName.VISA,
        SrcName.VISA,
        SrcName.VISA,
        null,
        SrcName.MASTERCARD,
      ]);
      done();
    });
  });
});
