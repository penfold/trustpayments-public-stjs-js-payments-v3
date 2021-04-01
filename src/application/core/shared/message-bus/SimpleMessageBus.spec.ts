import { SimpleMessageBus } from './SimpleMessageBus';
import { IMessageBusEvent } from '../../models/IMessageBusEvent';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';

describe('SimpleMessageBus', () => {
  const sampleEvent: IMessageBusEvent = { type: 'FOO', data: 'bar' };

  let messageBus: SimpleMessageBus;

  beforeEach(() => {
    messageBus = new SimpleMessageBus();
  });

  describe('publish', () => {
    it('publishes an event to message stream', done => {
      messageBus.subscribe(event => {
        expect(event).toBe(sampleEvent);
        done();
      });

      messageBus.publish(sampleEvent);
    });
  });

  describe('subscribe', () => {
    it('allows subscribing to messages from source stream', done => {
      const messages$ = new Subject<IMessageBusEvent>();

      messageBus = new SimpleMessageBus(messages$);
      messageBus.subscribe(event => {
        expect(event).toBe(sampleEvent);
        done();
      });

      messages$.next(sampleEvent);
    });

    it('allows subscribing using the legacy event type name', done => {
      messageBus = new SimpleMessageBus();

      messageBus.subscribeType('FOO', data => {
        expect(data).toBe('bar');
        done();
      });

      messageBus.publish(sampleEvent);
    });
  });

  describe('pipe', () => {
    it('allows piping the events', done => {
      messageBus.pipe(map(event => ({ type: event.type, data: `${event.data}${event.data}` }))).subscribe(event => {
        expect(event).toEqual({
          type: 'FOO',
          data: 'barbar',
        });
        done();
      });

      messageBus.publish(sampleEvent);
    });
  });
});
