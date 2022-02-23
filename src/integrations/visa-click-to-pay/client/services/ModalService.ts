import { BehaviorSubject, combineLatest, Subject } from 'rxjs';
import { Service } from 'typedi';
import { DomMethods } from '../../../../application/core/shared/dom-methods/DomMethods';
import { ModalFactory } from './ModalFactory';

const modalTargetElement = 'st-modal-wrapper';
const modalContentElement = 'st-modal';
const openedModalClass = 'st-modal--open';
const notificationClass = 'st-modal__notification';

@Service()
export class ModalService {
  private modalWrapperElement: HTMLElement;
  private modalOpened$ = new BehaviorSubject<boolean>(undefined);
  private modalContent$ = new Subject<HTMLElement>();

  constructor(private modalFactory: ModalFactory) {
    this.modalWrapperElement = DomMethods.createHtmlElement({ id: modalTargetElement }, 'div');
    DomMethods.appendChildIntoDOM('body', this.modalWrapperElement);
    this.displayModal();
  }

  show(content: HTMLElement){
    this.modalContent$.next(content);
    this.modalOpened$.next(true);
  }

  hide(): void {
    this.modalOpened$.next(false);
    this.modalContent$.next(null);
  }

  showNotification(notificationText: string){
    const notificationContainer = document.querySelector('.st-modal__header');
    if(!notificationContainer){
      return
    }
    const notificationElement = document.createElement('div');
    notificationElement.classList.add(notificationClass);
    notificationElement.innerText = notificationText;

    notificationContainer.appendChild(notificationElement);
  }
  private displayModal(): void {
    combineLatest([this.modalOpened$, this.modalContent$]).subscribe(
      ([modalOpen, modalContent]) => {
        if (modalOpen) {
          const modalContentWrapper = DomMethods.createHtmlElement({ class: modalContentElement }, 'div');
          const headerElement = this.modalFactory.createModalHeader(()=>this.hide());
          document.getElementById(modalTargetElement).appendChild(modalContentWrapper);
          modalContentWrapper.appendChild(headerElement);
          modalContentWrapper.appendChild(modalContent);
          document.getElementById(modalTargetElement).classList.add(openedModalClass);

        } else {
          document.getElementById(modalTargetElement)?.classList.remove(openedModalClass);
          DomMethods.removeElement(document.querySelector(`.${modalContentElement}`));
        }
      }
    );
  }

  clearNotifications() {
    const notifications = document.querySelectorAll(`.${notificationClass}`);
    notifications.forEach(element=>DomMethods.removeElement(element));
  }
}
