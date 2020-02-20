import { Service } from 'typedi';
import { AbstractStorage } from './AbstractStorage';

@Service()
export class BrowserLocalStorage extends AbstractStorage {
  constructor() {
    super(window.localStorage);
  }
}
