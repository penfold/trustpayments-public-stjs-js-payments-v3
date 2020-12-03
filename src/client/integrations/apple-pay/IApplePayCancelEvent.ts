export interface IApplePayCancelEvent {
  bubbles: boolean;
  cancelBubble: boolean;
  cancelable: boolean;
  comnposed: boolean;
  currentTarget: string | null;
  defaultPrevented: boolean;
  eventPhase: number;
  isTrusted: boolean;
  returnValue: boolean;
  sessionError: { code: string; info: object };
  srcElement: object;
  target: object;
  timeStamp: number;
  type: string;
}
