export const environment = {
  production: false,
  libraryUrl: 'https://webservices.securetrading.net/js/v2/st.js',
  configUrl: '/assets/config.json',
  jwtDataUrl: '/assets/jwtdata.json',
  jwtTokenizedUrl: (card) => `/assets/${card}-tokenizedJwtData.json`,
};
