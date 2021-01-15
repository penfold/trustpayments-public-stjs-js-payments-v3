export class GatewayError extends Error {
  constructor(message?: string) {
    super(message);
    Object.setPrototypeOf(this, GatewayError.prototype);
  }
}
