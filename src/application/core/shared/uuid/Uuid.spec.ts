import { Uuid } from './Uuid';

describe('Uuid', () => {
  let uuidInstance: Uuid;
  beforeEach(() => {
    uuidInstance = new Uuid();
  });
  
  it('should return encrypted query string with 36 characters', () => {
    expect(typeof uuidInstance.uuidv4()).toEqual('string');
    expect(uuidInstance.uuidv4().length).toEqual(36);
  });
});
