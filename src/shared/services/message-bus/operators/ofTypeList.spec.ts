import { count, from } from 'rxjs';
import { PUBLIC_EVENTS } from '../../../../application/core/models/constants/EventTypes';
import { ofTypeList } from './ofTypeList';

describe('ofTypeList operator', () => {
  it('should filter only values that are on array', () => {
    from([{
      type: PUBLIC_EVENTS.PAYMENT_METHOD_INIT_STARTED,
      data: {
        name: 'GooglePay',
      },
    },
      {
        type: PUBLIC_EVENTS.PAYMENT_METHOD_COMPLETED,
        data: {
          name: 'GooglePay',
        },
      },
      {
        type: PUBLIC_EVENTS.PAYMENT_METHOD_FAILED,
        data: {
          name: 'GooglePay',
        },
      },
    ]).pipe(
      ofTypeList([PUBLIC_EVENTS.PAYMENT_METHOD_FAILED, PUBLIC_EVENTS.PAYMENT_METHOD_COMPLETED]),
      count((value) => value !== null)
    ).subscribe((value) => {
      expect(value).toBe(2);
    });
  });
});

