const webpack = require('webpack');

let LIBRARY_URL;
let CONFIG_URL;

switch (process.env.NODE_ENV) {
  case 'prod':
    LIBRARY_URL = 'https://webservices.securetrading.net/js/v2/st.js';
    CONFIG_URL = '/config.json';
    break;
  case 'test':
    LIBRARY_URL = 'https://webservices.securetrading.net:8443/st.js';
    CONFIG_URL = 'https://webservices.securetrading.net:8443/config.json';
    break;
  case 'e2e':
    LIBRARY_URL = 'https://library.securetrading.net:8443/st.js';
    CONFIG_URL = null;
    break;
  default:
    LIBRARY_URL = 'https://localhost:8443/st.js';
    CONFIG_URL = '/config.json';
    break;
}

module.exports = {
  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        LIBRARY_URL: JSON.stringify(LIBRARY_URL),
        CONFIG_URL: JSON.stringify(CONFIG_URL),
      }),
    ],
  },
};
