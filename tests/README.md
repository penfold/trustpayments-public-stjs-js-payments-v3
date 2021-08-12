## Testing how-to
Selenium tests are stored in `tests` directory and all the below actions are to be executed in that directory.

## Prepare test environment:
1) Install all npm dependencies
```bash
   npm install
   npm rebuild node-sass
```

2) Prepare hosts: optional (required for running behave directly on your local machine console/pycharm)
   
You should add the domains below to your `hosts` file and point it to `127.0.0.1` (you can find how to do it here: https://support.rackspace.com/how-to/modify-your-hosts-file/).

* example page: `https://merchant.securetrading.net` 
* library:      `https://library.securetrading.net`
* wiremock:     `https://webservices.securetrading.net` and `https://thirdparty.example.com`


3) Install poetry: https://python-poetry.org/docs: optional (required for running behave directly on your local machine console/pycharm)


4) Prepare local environment for behave: optional (for running behave on local machine console/pycharm)
    ``` bash
    # Create virtualenv, in tests directory,
    /bin/bash python -m venv .venv
    # Active virtualenv (in pycharm just select correct virutalenv)
    /bin/bash source .venv/bin/activate # Linux
    # Install all dependencies
    /bin/bash poetry install
    ```
    https://docs.python.org/3/library/venv.html

## Running tests using docker images
Some tests (e.g. mocks) will require `docker` in order to execute.
For running tests using docker you should use script `tests/tests.sh`

The script `tests/tests.sh` required scripts (.cicd_scripts) form CICD to download this you can use script `init_script.sh` or manually download

### Mock tests using only docker containers headless mode (examples):
* build docker images and run containers:
  ```bash
  /bin/bash tests/tests.sh --mock --no-test-run
  ```
* run mock tests (note containers should be already prepared):
  ```bash
  /bin/bash tests/tests.sh --no-docker-build --test-file features/component_tests/mock_payments_with_request_types.feature
  ```
* build docker images and run containers then run tests based on feature file:
  ```bash
  /bin/bash tests/tests.sh --mock --test-file features/component_tests/mock_payments_with_request_types.feature
  ```
* build docker images and run containers then run tests based on tags:
  ```bash
  /bin/bash tests/tests.sh --mock --test-tags @visa_test
  ```

### Mock tests using docker (example app / wiremock) and tests executed directly on your machine:
1) prepare docker containers 
  ```bash
  /bin/bash tests/tests.sh --mock --no-test-run
  ```
2) run in console (you can run it after activating correct python venv)
  ```bash
  /bin/bash python -m behave --color features/component_tests/mock_payments_with_request_types.feature
  ```
Note: It is possible to run tests using Pycharm you need to only select correct virutalenv and working dir (should be `tests` directory)


### Tests with remote browser via browserstack:
1) In directory `binary` execute
`BrowserStackLocal.exe --key <BROWSERSTACK_ACCESS_KEY> --local-identifier local_id --force-local`

2) prepare docker containers 
  ```bash
  /bin/bash tests/tests.sh --mock --no-test-run
  ```
3) Step environment variables e.g:
  ```bash
  /bin/bash export LOCAL=true
  /bin/bash export REMOTE=true
  /bin/bash export BROWSER=Chrome
  /bin/bash export BROWSER_VERSION=80.0 
  /bin/bash export OS=Windows 
  /bin/bash export OS_VERSION=10
  /bin/bash export BS_USERNAME=<BROWSERSTACK_USERNAME> 
  /bin/bash export BS_ACCESS_KEY=<BROWSERSTACK_ACCESS_KEY>
  ```
4) run in console (you can run it after activating correct python venv)
  ```bash
  /bin/bash python -m behave --color features/component_tests/mock_payments_with_request_types.feature
  ```


## Cleanup all docker images / containers:
```bash
  /bin/bash tests/tests.sh --cleanup-docker --no-test-run --no-docker-build
```

Most test directories which may change are mounted as a docker volume, so you should be able to update tests and rerun them without rebuilding the test image.

In case of change sources you should rebuild your images.

Of course the fastest way to execute test would be using python and behave locally.

Keep in mind that your local environment can differ to GitLab, the final tests must pass in the pipeline before MRs will be accepted.

## License

- [MIT](https://opensource.org/licenses/MIT)
