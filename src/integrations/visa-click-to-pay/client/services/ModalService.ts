import { BehaviorSubject, Subject, combineLatest } from 'rxjs';
import { Service } from 'typedi';
import { DomMethods } from '../../../../application/core/shared/dom-methods/DomMethods';
import { modalSignInEmail } from './ModalContent';

const modalTargetElement = 'st-modal-wrapper';
const modalContentElement = 'modal';
const closeElement = 'st-modal-close-btn';

@Service()
export class ModalService {
  private modalWrapperElement: Element;
  private modalOpened$ = new BehaviorSubject<boolean>(undefined);
  private modalContent$ = new Subject<HTMLElement>();

  constructor() {
    this.displayModal();
    // example usage:
    this.show(modalSignInEmail);
  }

  show(content: HTMLElement): void {
    this.modalWrapperElement = DomMethods.createHtmlElement({ id: modalTargetElement }, 'div');
    document.body.appendChild(this.modalWrapperElement);
    this.modalContent$.next(content);
    this.modalOpened$.next(true);
    this.closeModalListener();
  }

  hide(): void {
    this.modalOpened$.next(false);
    this.modalContent$.next(null);
  }

  private displayModal(): void {
    combineLatest([this.modalOpened$,this.modalContent$]).subscribe(
      ([modalOpen, modalContent]) => {
        if (modalOpen) {
          document.getElementById(modalTargetElement).appendChild(DomMethods.createHtmlElement({ class: modalContentElement }, 'div'));
          document.getElementsByClassName(modalContentElement)[0].appendChild(modalContent);
          document.getElementById(modalTargetElement).classList.add('open');
        } else {
          document.getElementById(modalTargetElement).classList.remove('open');
          document.getElementsByClassName(modalContentElement)[0].remove();
        }
      }
    );
  }
  
  private closeModalListener(): void {
    document.getElementById(closeElement).addEventListener('click', event => {
      event.preventDefault();
      this.hide();
    });
  }
}
