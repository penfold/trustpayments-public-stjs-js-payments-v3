import { applyMiddleware, combineReducers, createStore, Reducer, Store } from 'redux';
import { configReducer } from './reducers/config/ConfigReducer';
import { Service } from 'typedi';
import logger from 'redux-logger';
import { combineEpics, createEpicMiddleware, Epic, EpicMiddleware } from 'redux-observable';
import { catchError } from 'rxjs/operators';
import { IAction } from './IAction';
import { environment } from '../../../environments/environment';
import { storageReducer } from './reducers/storage/StorageReducer';

@Service()
export class StoreFactory {
  createStore(): Store {
    const epicMiddleware = createEpicMiddleware();
    const middlewares: any[] = [epicMiddleware];

    if (!environment.production) {
      middlewares.push(logger);
    }

    const store = createStore(this.getRootReducer(), applyMiddleware(...middlewares));

    epicMiddleware.run(this.getRootEpic());

    return store;
  }

  private getRootReducer(): Reducer {
    return combineReducers({
      config: configReducer,
      storage: storageReducer
    });
  }

  private getRootEpic(): Epic<IAction> {
    const epics: Epic[] = [];

    return (action$, store$, dependencies) => {
      return combineEpics(...epics)(action$, store$, dependencies).pipe(
        catchError((error, source) => {
          console.error(error);

          return source;
        })
      );
    };
  }
}
