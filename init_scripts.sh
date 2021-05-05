#!/usr/bin/env bash
set -eu -o pipefail -E

INFERRED_BRANCH=""
REQUESTED_BRANCH=""
BRANCH=""

# Parse and validate arguments
while [[ $# -gt -0 ]]; do

    case "$1" in

        -b | --branch)
            REQUESTED_BRANCH="$2"
            shift
            ;;

        *)
            (echo >&2 "Invalid argument: $@")
            exit 1
            ;;

    esac
    shift

done

# Try to figure out CICD version from .gitlab-ci.yaml
PATTERN="^(\.project-infrastructure-cicd-ref:\s+&project-infrastructure-cicd-ref\s+)(.*)$"
INFERRED_BRANCH="$(grep -E "${PATTERN}" "${BASH_SOURCE%/*}"/.gitlab-ci.yml | sed -E "s/${PATTERN}/\2/")"

if [[ "${REQUESTED_BRANCH}" != "" ]]; then

    if [[ "${INFERRED_BRANCH}" != "" ]] && [[ "${INFERRED_BRANCH}" != "${BRANCH}" ]]; then
        echo "WARNING: You requested CICD scripts from branch that is different to what your .gitlab-ci.yml"
        echo "         is currently using. This may lead to different behaviour locally and when running pipelines."
    fi

    BRANCH="${REQUESTED_BRANCH}"

elif [[ "${INFERRED_BRANCH}" != "" ]]; then
    echo "Using CICD branch ${INFERRED_BRANCH} as specified in .gitlab-ci.yml."
    BRANCH="${INFERRED_BRANCH}"

else
    echo "WARNING: Failed to infer CICD branch from .gitlab-ci.yml. Using master."
    echo "         This may lead to different behaviour locally and when running pipelines."
    BRANCH="master"
fi

rm -rf cicd_repo .cicd_scripts

git clone --depth=1 --branch="${BRANCH}" -c advice.detachedHead=false git@gitlab.com:securetrading-gl/st-server-project/project-infrastructure-cicd.git cicd_repo
mv cicd_repo/.cicd_scripts "${BASH_SOURCE%/*}"
rm -rf cicd_repo
test -d .cicd_scripts

echo ""
echo "All done."
echo "You can now use CICD scripts locally by calling them from '.cicd_scripts/' directory."
