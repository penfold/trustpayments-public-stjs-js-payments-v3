import { Frame } from './Frame';

describe('Frame', () => {
  it.each([
    ['/myframe.html', { styles: [] }],
    ['/myframe.html?mykey=some%20value', { styles: [{ mykey: 'some value' }] }],
    ['/myframe.html?mykey=some%20value&locale=fr_FR', { locale: 'fr_FR', styles: [{ mykey: 'some value' }] }],
    [
      '/myframe.html?mykey=some%20value&locale=fr_FR&origin=https%3A%2F%2Fexample.com',
      { origin: 'https://example.com', locale: 'fr_FR', styles: [{ mykey: 'some value' }] },
    ],
    [
      '/card-number.html?background-color-input=AliceBlue&color-input-error=%23721c24&line-height-input=12px&font-size-input=12px&background-color-input-error=%23f8d7da',
      {
        styles: [
          {
            'background-color-input': 'AliceBlue',
          },
          {
            'color-input-error': '#721c24',
          },
          {
            'line-height-input': '12px',
          },
          {
            'font-size-input': '12px',
          },
          {
            'background-color-input-error': '#f8d7da',
          },
        ],
      },
    ],
  ])('Frame.parseUrl', (url, expected) => {
    const frame = new Frame();
    window.history.pushState({}, 'Test Title', url);
    // @ts-ignore
    frame.getAllowedParams = jest.fn().mockReturnValueOnce(['locale', 'origin']);
    // @ts-ignore
    const actual = frame.parseUrl();
    expect(Object.entries(actual).length).toBe(Object.entries(expected).length);
    expect(actual).toMatchObject(expected);
  });
});
