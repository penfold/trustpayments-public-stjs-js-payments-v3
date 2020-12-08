import { Token } from 'typedi';
import { IConfig } from '../model/config/IConfig';
import { IMessageSubscriber } from '../services/message-bus/interfaces/IMessageSubscriber';
import { IMessageBus } from '../../application/core/shared/message-bus/IMessageBus';

export const WINDOW = new Token<Window>();
export const CONFIG = new Token<IConfig>();
export const MessageSubscriberToken = new Token<IMessageSubscriber>();
export const MessageBusToken = new Token<IMessageBus>();
