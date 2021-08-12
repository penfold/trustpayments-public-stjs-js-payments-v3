import { PRIVATE_EVENTS, PUBLIC_EVENTS } from '../../models/constants/EventTypes';

// @deprecated - do not use, use PRIVATE_EVENTS and PUBLIC_EVENTS directly
export const MessageBus = {
  EVENTS: PRIVATE_EVENTS,
  EVENTS_PUBLIC: PUBLIC_EVENTS,
};
