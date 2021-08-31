const webpack = require('webpack');

let LIBRARY_URL;
let CONFIG_URL;
let JWT_DATA_URL;

switch (process.env.NODE_ENV) {
  case 'prod':
    LIBRARY_URL = 'https://webservices.securetrading.net/js/v3/st.js';
    CONFIG_URL = '/json/config.json';
    JWT_DATA_URL = '/json/jwtdata.json';
    break;
  case 'test':
    LIBRARY_URL = 'https://webservices.securetrading.net:8443/st.js';
    CONFIG_URL = 'https://webservices.securetrading.net:8443/config.json';
    JWT_DATA_URL = 'https://webservices.securetrading.net:8443/jwtdata.json';
    break;
  case 'e2e':
    LIBRARY_URL = 'https://library.securetrading.net:8443/st.js';
    CONFIG_URL = null;
    JWT_DATA_URL = null;
    break;
  default:
    LIBRARY_URL = 'https://localhost:8443/st.js';
    CONFIG_URL = '/json/config.json';
    JWT_DATA_URL = '/json/jwtdata.json';
    break;
}

module.exports = {
  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        LIBRARY_URL: JSON.stringify(LIBRARY_URL),
        CONFIG_URL: JSON.stringify(CONFIG_URL),
        JWT_DATA_URL: JSON.stringify(JWT_DATA_URL),
      }),
    ],
  },
};
