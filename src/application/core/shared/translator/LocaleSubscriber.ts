import { Service } from 'typedi';
import { IMessageBus } from '../message-bus/IMessageBus';
import { ofType } from '../../../../shared/services/message-bus/operators/ofType';
import { PUBLIC_EVENTS } from '../../models/constants/EventTypes';
import { filter, map, takeUntil } from 'rxjs/operators';
import { IMessageBusEvent } from '../../models/IMessageBusEvent';
import { IStJwtPayload } from '../../models/IStJwtPayload';
import { JwtDecoder } from '../../../../shared/services/jwt-decoder/JwtDecoder';
import { IMessageSubscriber } from '../../../../shared/services/message-bus/interfaces/IMessageSubscriber';
import { MessageSubscriberToken } from '../../../../shared/dependency-injection/InjectionTokens';
import { ITranslator } from './ITranslator';
import { IUpdateJwt } from '../../models/IUpdateJwt';

@Service({ id: MessageSubscriberToken, multiple: true })
export class LocaleSubscriber implements IMessageSubscriber {
  constructor(private translator: ITranslator, private jwtDecoder: JwtDecoder) {}

  register(messageBus: IMessageBus): void {
    const destroy$ = messageBus.pipe(ofType(PUBLIC_EVENTS.DESTROY));

    messageBus
      .pipe(
        ofType(PUBLIC_EVENTS.UPDATE_JWT),
        map((event: IMessageBusEvent<IUpdateJwt>) => this.jwtDecoder.decode(event.data.newJwt).payload),
        filter((payload: IStJwtPayload) => !!payload.locale),
        takeUntil(destroy$)
      )
      .subscribe((payload: IStJwtPayload) => {
        this.translator.changeLanguage(payload.locale);
      });
  }
}
