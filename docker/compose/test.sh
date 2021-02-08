#!/usr/bin/env bash
set -eu -o pipefail -E

function test() {
  params=$1

  docker-compose $params up --build -d
  #docker-compose $params up -d
  docker-compose $params run payments-tests /bin/bash -c "\
    . venv/bin/activate \
    && echo 'Python venv activated. Executing tests.' \
    && python3 -m behave --color --logging-level INFO --tags=@e2e_smoke_test"
}

function cleanup() {
  params=$1
  docker-compose $params down
  docker stop $(docker ps -aq) || true # stop all containers
  docker system prune -a -f # delete all docker containers, images, networking
}

test_version="-f docker/compose/docker-compose.yml -f docker/compose/docker-compose.test.yml"
dev_version="-f docker/compose/docker-compose.yml -f docker/compose/docker-compose.dev.yml"


test "${test_version}"
cleanup "${test_version}"
