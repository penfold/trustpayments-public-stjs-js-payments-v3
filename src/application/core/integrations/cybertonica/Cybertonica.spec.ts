import { mock } from 'ts-mockito';
import { BrowserLocalStorage } from '../../../../shared/services/storage/BrowserLocalStorage';
import { Cybertonica } from './Cybertonica';

describe('Cybertonica', () => {
  const { instance } = cybertonicaFixture();

  describe('_onInit', () => {
    beforeEach(() => {
      // @ts-ignore
      instance._insertCybertonicaLibrary = jest.fn();
      // @ts-ignore
      instance._insertCybertonicaLibrary = jest.fn().mockResolvedValueOnce('TID VALUE');
    });

    it('should call _insertCybertonicaLibrary', async () => {
      // @ts-ignore
      instance.init();
      // @ts-ignore
      expect(instance._insertCybertonicaLibrary).toHaveBeenCalled();
    });
  });

  describe('getBasename', () => {
    it('should calculate base name', async () => {
      // @ts-ignore
      const data = await Cybertonica.getBasename();
      // @ts-ignore
      expect(data).toEqual('https://cyber.securetrading.net');
    });
  });
});

function cybertonicaFixture() {
  const localStorage: BrowserLocalStorage = mock(BrowserLocalStorage);
  localStorage.getItem = jest.fn().mockReturnValueOnce('en');
  const instance = new Cybertonica(localStorage);
  return { instance };
}
