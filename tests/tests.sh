#!/usr/bin/env bash
set -eu -o pipefail -E

NAME="$(basename "$0")"

# shellcheck source=../../other/utils.sh
source "${BASH_SOURCE%/*}/../.cicd_scripts/other/utils.sh"

export CI_REGISTRY_IMAGE="registry.gitlab.com/trustpayments-public/stjs/js-payments-v3"

function usage() {
  echo "Usage:"
  echo "$(basename "$0") [OPTIONS]"
  echo ""
  echo "Runs specified tests under docker compose."
  echo ""
  echo "Note: This script required scripts from cicd_scripts."
  echo "      If you do not have them please use it script 'init_scripts.sh' to download them."
  echo ""
  echo "Where:"
  echo "  --test-tags"
  echo "    Specified tags for behave tests."
  echo "  --test-file"
  echo "    Specified file for behave tests."
  echo "  --mock"
  echo "    When provided wiremock will be created use it for tests required wiremock"
  echo "  --no-test-run"
  echo "    When provided tests will not start"
  echo "  --no-docker-build"
  echo "    When provided docker images will not be rebuild and started."
  echo "    Note: Docker containers should already be running if you want run tests"
  echo "  --cleanup-docker"
  echo "    When provided it will remove all docker containers/images at the end of script"
}

function rebuild_sdk() {
  local mock="$1"
  local build_type="prod"

  if [[ "${mock}" == "true" ]]; then
    build_type="mock"
  fi

  log_this INFO "Rebuild SDK build: npm run build:${build_type} --frame_url=https://library.securetrading.net:8443"
  (cd "${BASH_SOURCE%/*}/.." ; npm run build:"${build_type}" --frame_url="https://library.securetrading.net:8443")
}

function rebuild_example_html() {
  local mock="$1"
  local build_type="prod"

  if [[ "${mock}" == "true" ]]; then
    build_type="mock"
  fi

  log_this INFO "Rebuild Example HTML app build: npm run build:${build_type}"
  (cd "${BASH_SOURCE%/*}/../example/html" ; npm run build:"${build_type}")
}

function rebuild_images () {
  local mock="$1"

  log_this INFO "Rebuild docker mock: ${mock}"
  if [[ "${mock}" == "true" ]]; then
    (cd "${BASH_SOURCE%/*}/.." ;
     docker-compose -f docker/compose/docker-compose.yml -f docker/compose/docker-compose.mock.yml up --build -d)
  else
    (cd "${BASH_SOURCE%/*}/.." ;
      docker-compose -f docker/compose/docker-compose.yml up --build -d)
  fi
}

function run_test_docker() {
  local test_tags="$1"
  local test_file="$2"
  local test_loglevel="$3"

  log_this INFO "Start tests inside docker container."

  if [[ -n "${test_tags}" ]]; then
    test_tags="--tags=${test_tags}"
  fi

  docker-compose -f docker/compose/docker-compose.yml run payments-tests /bin/bash -c "\
      . venv/bin/activate \
      && echo 'Python venv activated. Executing tests.' \
      && python3 -m behave --color --logging-level ${test_loglevel} ${test_tags} ${test_file}"
}

function cleanup_docker() {
  log_this INFO "Cleanup docker."
  docker-compose -f docker/compose/docker-compose.yml -f docker/compose/docker-compose.mock.yml down
  docker stop $(docker ps -aq) || true # stop all containers
  docker system prune -a -f # delete all docker containers, images, networking
}

function main() {
  # Arguments
  local test_tags=""
  local test_file=""
  local test_loglevel="INFO"
  local mock="false"

  local no_test_run="false"
  local no_docker_build="false"
  local cleanup_docker="false"

  # Parse command line arguments
  while [[ $# -gt -0 ]]; do
    case "$1" in
      --test-tags)
        test_tags="$2"
        shift
        ;;
      --test-file)
        test_file="$2"
        shift
        ;;
      --test-loglevel)
        test_loglevel="$2"
        shift
        ;;
      --mock)
        mock="true"
        ;;
      --no-test-run)
        no_test_run="true"
        ;;
      --no-docker-build)
        no_docker_build="true"
        ;;
      --cleanup-docker)
        cleanup_docker="true"
        ;;
      -h|--help)
        usage
        exit 0
        ;;
      *)
        (echo >&2 "Invalid argument: $1")
        usage
        exit 1
        ;;
    esac
    shift
  done

  log_this INFO "${NAME}: Started."
  log_info_variable test_tags        "${test_tags}"
  log_info_variable test_file        "${test_file}"
  log_info_variable test_loglevel    "${test_loglevel}"
  log_info_variable mock             "${mock}"
  log_info_variable no_test_run      "${no_test_run}"
  log_info_variable no_docker_build  "${no_docker_build}"
  log_info_variable cleanup_docker   "${cleanup_docker}"

  if [[ "${no_docker_build}" != "true" ]]; then
    rebuild_sdk "${mock}"
    rebuild_example_html "${mock}"
    rebuild_images "${mock}"
  fi

  if [[ "${no_test_run}" != "true" ]]; then
    run_test_docker "${test_tags}" "${test_file}" "${test_loglevel}"
  fi

  if [[ "${cleanup_docker}" == "true" ]]; then
    cleanup_docker
  fi
  log_this INFO "${NAME}: Finished."
}

main "$@"
