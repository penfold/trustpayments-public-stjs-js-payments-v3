import { Service } from 'typedi';

@Service()
export class Uuid {
  uuidv4(): string {
    return window.crypto ? this.uuidv4crypto() : this.uuidv4random();
  }

  private uuidv4crypto(): string {
    // @ts-ignore
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c: string) =>
      (Number(c) ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (Number(c) / 4)))).toString(16)
    );
  }

  private uuidv4random(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c: string) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;

      return v.toString(16);
    });
  }
}
