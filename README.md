# JS Library

[![Build Status](https://travis-ci.org/SecureTrading/js-payments.svg?branch=develop)](https://travis-ci.org/SecureTrading/js-payments) <!-- Coveralls --> [![Coverage Status](https://coveralls.io/repos/github/SecureTrading/js-payments/badge.svg?branch=develop)](https://coveralls.io/github/SecureTrading/js-payments?branch=develop) <!-- Browserstack --> [![BrowserStack Status](https://automate.browserstack.com/badge.svg?badge_key=MmtHNitGbnZGQkU2SUtjMnhaVzU1TmQvQmY0ekdUWWNSMjQyQlBjelo2TT0tLVJaTlpOUURWcUFGZ0pMaWNkb0ozNWc9PQ==--b7ca641d77507875feedba229c56cb484a5546ad)](https://automate.browserstack.com/public-build/MmtHNitGbnZGQkU2SUtjMnhaVzU1TmQvQmY0ekdUWWNSMjQyQlBjelo2TT0tLVJaTlpOUURWcUFGZ0pMaWNkb0ozNWc9PQ==--b7ca641d77507875feedba229c56cb484a5546ad) <!-- Dependabot --> [![Dependabot badge](https://img.shields.io/badge/Dependabot-enabled-brightgreen.svg)](https://app.dependabot.com/) <!-- Snyk --> [![Known Vulnerabilities](https://snyk.io/test/github/SecureTrading/js-payments/develop/badge.svg)](https://snyk.io/test/github/SecureTrading/js-payments/develop)

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
- [Prettier](https://prettier.io/)
- [Stylelint](https://stylelint.io/)
- [TSLint](https://palantir.github.io/tslint/)
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


## Testing how-to

Selenium tests are stored in `tests` directory and all the below actions are to be executed in that directory.

##### Application docker

Some tests (e.g. mocks) will required the docker in order to execute them.

Aplication docker will be pulled from gitlab's container registry

The address to an appropiate image is stored in `.env` file and can be edited.

##### Start up the docker containers

`docker-compose up -d`

The example page is available under address `https://merchant.securetrading.net/`. You should add this domain to your `hosts` file
and point to address `127.0.0.1` (here you can find how to do it https://support.rackspace.com/how-to/modify-your-hosts-file/).

The Wiremock is available under `https://webservices.securetrading.net:8443/` so to access it you should also add this address
to the `hosts` file.

##### To run the tests

`docker-compose run tests poetry run behave features`

##### To test a different branch

If you have multiple application images with different branches you can specify which image should be used for tests, eg.:

`APP_TAG=master docker-compose up -d`


##### To run with a remote browser via browserstack:
In directory `binary` execute
`BrowserStackLocal.exe --key <BROWSERSTACK_ACCESS_KEY> --local-identifier local_id --force-local`

Then, to run
 `docker-compose run -e LOCAL=true -e REMOTE=true -e BROWSER=Chrome -e BROWSER_VERSION=80.0 -e OS=Windows -e OS_VERSION=10
 -e BS_USERNAME=<BROWSERSTACK_USERNAME> -e BS_ACCESS_KEY=<BROWSERSTACK_ACCESS_KEY> tests poetry run behave features`

## License

- [MIT](https://opensource.org/licenses/MIT)
