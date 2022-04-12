# How to contribute
1. Fork existing repository
1. Your branch MUST be prefixed with **CONTRIBUTING**
   
   Perfect branch format: CONTRIBUTING-<ISSUE_NUMBER>-<ISSUE_TITLE>
   
   If those changes don't relate to an existing Issue you can explain your changes in Merge Request Description

1. Update the code in your forked repository and newly created branch, then push changes
   
1. Check if your pipeline succeeded (green)

1. Create Merge Request to the `master` branch in original repo

1. Wait for approvals or comments from the development team.

1. Merge Request can be merged when:

   2. MR will gather all required approvals
   
   2. Pipeline will succeed
   
   2. All comments from Code Review will be resolved

## Submission Guidelines

##### Repository:

> - [GitLab](https://gitlab.com/trustpayments-public/stjs/js-payments)
> - [GitHub (old/deprecated)](https://gitlab.com/trustpayments-public/stjs/js-payments)

## Code Style, Naming convention

> - [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
> - [Gitflow](https://pl.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)
> - DRY, SOLID, KISS, YAGNI
> - name of branch - feature/ST-number-of-task-name-of-task - for more information please refer to the [Gitflow](https://pl.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)

## How to launch project locally ?

> - You must have npm installed, then just run 'npm install' in project root directory.
> - Available run scripts are in section below

## Available Scripts

> - `test: jest --watch`
> - `coverage: jest --coverage`
> - `dev: webpack --config webpack.dev.cjs`
> - `prod: webpack --config webpack.prod.cjs`
> - `start: webpack-dev-server --color --progress --open --hot --config webpack.dev.cjs`
> - `hot: npm-run-all dev start`

## How to launch docker ?

If you wish to run the docker container which hosts the same distribution files as the npm run prod you can run the following:

> - `docker build . --tag securetrading1/js-payments`
> - `docker run -d -p 8443:8443 -p 8760:8760 -it securetrading1/js-payments`

## How to run behavioural tests ?

Travis will automatically run behavioural tests on all push/pull commits - these must pass before any PR will be accepted
