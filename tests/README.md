## Testing how-to

Selenium tests are stored in `tests` directory and all the below actions are to be executed in that directory.

### Application docker

Some tests (e.g. mocks) will require `docker` in order to execute.

### Start up the docker containers
The example page is available under `https://merchant.securetrading.net/`. You should add this domain to your `hosts` file
and point it to `127.0.0.1` (you can find how to do it here: https://support.rackspace.com/how-to/modify-your-hosts-file/).

Wiremock is available under `https://webservices.securetrading.net:8443/` so to access it you should also add this address
to the `hosts` file.

Decide if you want to execute "test" (works on mocks) or "dev" (without wiremocks) version and choose one:
```bash
TEST_VERSION="-f docker/compose/docker-compose.yml -f docker/compose/docker-compose.test.yml"
TEST_BUILD_TYPE="test"

DEV_VERSION="-f docker/compose/docker-compose.yml -f docker/compose/docker-compose.dev.yml"
DEV_BUILD_TYPE="dev"
```

Build docker images and run them (in this example you can see test version):
```bash'
npm run build:${TEST_BUILD_TYPE}

docker-compose $TEST_VERSION up -d
# OR force rebuild version:
# docker-compose $TEST_VERSION up --build -d
```

Now execute tests with containers created locally:
```bash
docker-compose $TEST_VERSION run payments-tests /bin/bash -c "\
   && . venv/bin/activate \
   && python3 -m behave --color --logging-level INFO --tags=@smoke_test_part_1"
```

Most test directories which may change are mounted as a docker volume, so you should be able to update tests and rerun them without rebuilding the test image.

In case of change sources you should rebuild your images.

Of course the fastest way to execute test would be using python and behave locally.

Keep in mind that your local environment can differ to GitLab, the final tests must pass in the pipeline before MRs will be accepted.

Cleanup (turn off containers):
```bash
docker-compose $TEST_VERSION down
```

Sample test with some useful commands (executed from project root):
```bash
/bin/bash docker/compose/test.sh
```

##### To run with a remote browser via browserstack:
In directory `binary` execute
`BrowserStackLocal.exe --key <BROWSERSTACK_ACCESS_KEY> --local-identifier local_id --force-local`

Then, to run
```bash
docker-compose $TEST_VERSION run -e LOCAL=true -e REMOTE=true -e BROWSER=Chrome -e BROWSER_VERSION=80.0 -e OS=Windows -e OS_VERSION=10
 -e BS_USERNAME=<BROWSERSTACK_USERNAME> -e BS_ACCESS_KEY=<BROWSERSTACK_ACCESS_KEY> payments-tests poetry run behave features
```

## License

- [MIT](https://opensource.org/licenses/MIT)
