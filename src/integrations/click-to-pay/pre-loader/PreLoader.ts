import { Service } from 'typedi';
import './PreLoader.scss';

@Service()
export class PreLoader {

  constructor(
   ) {
  }

  showLoader(loaderId: string): void {
    try {
    const container: HTMLElement = document.getElementById(loaderId);
    const viewLoader = document.createElement('div');
    viewLoader.classList.add('loader');
    viewLoader.innerHTML = `<div class='loader-wheel'></div>
                              <div class='loader-text'></div>`;
    container.appendChild(viewLoader);
    } catch (error) {
      throw new Error('Show Loader Error');
    }
  }

  hideLoader(loaderId: string):void {
    try {
      const list = document.getElementById(loaderId);
      list.hasChildNodes() && list.removeChild(list.children[0]);
    } catch (error) {
      throw new Error('Hide Loader Error');
    }
  }

  displayCardAddSection(initParams: any):void {
    try {
        document.querySelector('.ctp-add-card-section').classList.remove('hidden');
        document.querySelector('.ctp-submit-section').classList.remove('hidden');
    } catch (error) {
        throw new Error('Display Card Add Section Error');
    }
  }
}
