export class ArrayUtils {
  static unique<T>(array: T[]): T[] {
    return Array.from(new Set(array).values());
  }
}
