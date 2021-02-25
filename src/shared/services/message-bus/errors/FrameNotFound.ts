export class FrameNotFound extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, FrameNotFound.prototype); // required for instanceof check
  }
}
