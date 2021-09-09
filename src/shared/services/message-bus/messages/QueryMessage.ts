import { IMessageBusEvent } from '../../../../application/core/models/IMessageBusEvent';
import { Uuid } from '../../../../application/core/shared/uuid/Uuid';

export class QueryMessage implements IMessageBusEvent {
  static readonly MESSAGE_TYPE = 'ST_QUERY';
  readonly type = QueryMessage.MESSAGE_TYPE;
  readonly queryId: string;

  constructor(readonly data: IMessageBusEvent, readonly sourceFrame: string, readonly uuid: Uuid) {
    this.queryId = this.uuid.uuidv4();
  }
}
