# JS Library

A JavaScript interface for allowing tokenization and authorisation of payments through SecureTrading.

## Quickstart

You can check JS Library in action by running it on your local environment. To do this, run commands below:

```
npm install
npm start
```

Then open address `https://localhost:8443` in your web browser.

Please be aware, that NPM uses the configuration from `package.json` file and by default hostname is set to `localhost`. To use another hostname you should set a configuration variable by running the command below:

```
npm config set js-payments:host YOUR_HOSTNAME
```

## API Reference

- [API documentation](https://docs.securetrading.com/document/api/getting-started/)

## Mock-ups, graphics

Not specified yet

## Technology Stack:

##### Tools and languages:

- [TypeScript](https://www.typescriptlang.org/)
- [ES6](https://developer.mozilla.org/en-US/docs/Web/JavaScript) + [Babel](https://babeljs.io/)
- [Webpack](https://webpack.js.org/)
- [npm](https://www.npmjs.com/)
- [Sass (SCSS + BEM)](https://sass-lang.com/)
- [PostCSS](https://postcss.org/)
- [Stylelint](https://stylelint.io/)
- [ESLint](https://eslint.org/)

##### CI/CD:

- [Dependabot](https://dependabot.com/)
- [Snyk](https://snyk.io/)
- [Coveralls](https://coveralls.io/)
- [Travis CI](https://travis-ci.org/)
- [BrowserStack](https://www.browserstack.com/)

[<img alt="BrowserStack" src="browserstack-logo.png" width="300" />](https://www.browserstack.com/)

##### Automated tests:

- [Jest](https://jestjs.io/) for unit testing
- [Selenium (Java)](https://www.seleniumhq.org/) + [BrowserStack](https://www.browserstack.com/) for UI testing

## Browser compatibility:

- Internet Explorer 10 or later
- Latest versions of the following:
  - Chrome
  - Firefox
  - Edge
  - Safari


## [Testing - README](tests/README.md)

## License

- [MIT](https://opensource.org/licenses/MIT)


## Contact Support

If you need assistance with your integration or are experiencing issues with our JS library, please contact our Technical Support Team at [support@trustpayments.com](mailto:support@trustpayments.com)