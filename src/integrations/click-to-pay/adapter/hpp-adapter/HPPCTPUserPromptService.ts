import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { Service } from 'typedi';
import { distinctUntilChanged } from 'rxjs/operators';
import { DomMethods } from '../../../../application/core/shared/dom-methods/DomMethods';
import { HPPCTPUserPromptFactory } from './HPPCTPUserPromptFactory';

const modalContentElement = 'st-hpp-prompt';
const openedModalClass = 'st-hpp-prompt--open';
const notificationClass = 'st-hpp-prompt__notification';

@Service()
export class HPPCTPUserPromptService {
  private modalOpened$ = new BehaviorSubject<boolean>(undefined);
  private modalContent$ = new Subject<HTMLElement>();
  private modalTargetElement: HTMLElement;

  constructor(private modalFactory: HPPCTPUserPromptFactory) {
    this.init();
  }

  show(content: HTMLElement, target: HTMLElement) {
    this.modalTargetElement = target;
    this.modalContent$.next(content);
    this.modalOpened$.next(true);
  }

  hide(): void {
    this.modalOpened$.next(false);
    this.modalContent$.next(null);
  }

  showNotification(notificationText: string) {
    const notificationContainer = document.querySelector('.st-hpp-prompt__header');
    if (!notificationContainer) {
      return;
    }
    const notificationElement = document.createElement('div');
    notificationElement.classList.add(notificationClass);
    notificationElement.innerText = notificationText;

    notificationContainer.appendChild(notificationElement);
  }

  clearNotifications() {
    const notifications = document.querySelectorAll(`.${notificationClass}`);
    notifications.forEach(element => DomMethods.removeElement(element));
  }

  getStateChanges(): Observable<boolean> {
    return this.modalOpened$.pipe(distinctUntilChanged());
  }

  private init(): void {
    combineLatest([this.modalOpened$, this.modalContent$]).subscribe(
      ([modalOpen, modalContent]) => {
        if (modalOpen) {
          const modalContentWrapper = DomMethods.createHtmlElement({ class: modalContentElement }, 'div');
          const headerElement = this.modalFactory.createModalHeader(() => this.hide());
          DomMethods.removeElement(document.querySelector(`.${modalContentElement}`));
          this.modalTargetElement.appendChild(modalContentWrapper);
          modalContentWrapper.appendChild(headerElement);
          modalContentWrapper.appendChild(modalContent);
          this.modalTargetElement.classList.add(openedModalClass);
        } else {
          this.modalTargetElement?.classList.remove(openedModalClass);
          DomMethods.removeElement(document.querySelector(`.${modalContentElement}`));
        }
      }
    );
  }
}
