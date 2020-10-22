import { IConfigActionsMap } from './reducers/config/IConfigActionsMap';
import { IStorageActionsMap } from './reducers/storage/IStorageActionsMap';

export type IActionsMap = IConfigActionsMap & IStorageActionsMap;
