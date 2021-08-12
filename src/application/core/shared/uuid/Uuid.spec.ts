import { Uuid } from './Uuid';

describe('Uuid', () => {
  it('should return encrypted query string with 36 characters', () => {
    expect(typeof Uuid.uuidv4()).toEqual('string');
    expect(Uuid.uuidv4().length).toEqual(36);
  });
});
