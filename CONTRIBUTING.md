The [Genesis Global](https://genesis.global) Community Success initiative is committed to open-sourcing select technologies that we believe the open-source community would benefit from.

# Contributing to Custom Elements LSP Plugin

When contributing to Custom Elements LSP Plugin (CEP), please follow the standards defined in this guide.

## Getting started

### Workstation Setup

To work with the project you'll need Git, and Node.js.

CEP uses Git as its source control system. If you haven't already installed it, you can download it [here](https://git-scm.com/downloads) or if you prefer a GUI-based approach, try [GitHub Desktop](https://desktop.github.com/).

Once Git is installed, you'll also need Node.js, which CEP uses as its JavaScript runtime, enabling its build and test scripts. Node.js instructions and downloads for your preferred OS can be found [here](https://nodejs.org/en/).

Other dependencies you'll need to use for working on CEP are installed via `npm`, such as the `TypeScript` compiler.

### Cloning the repository

Now that your machine is setup, you can clone the CEP repository. Open a terminal and run this command:

```shell
git clone git@github.com:genesiscommunitysuccess/custom-elements-lsp.git
```

Cloning via HTTP:

```shell
git clone https://github.com/genesiscommunitysuccess/custom-elements-lsp.git
```

### Installing and building

When working on the LSP codebase itself, it is useful to be running an application in order to see what functionality is and is not working. The app in `/example` is setup to use the LSP plugin out of the box for NVIM and VSCode currently, other LSP IDEs may need some other configuration.

While developing:

1. `npm run bootstrap` will do all required setup for installing and building packages for working on the LSP and using the test example apps. You should rerun this every time you change a dependency.
2. `npm run clean` can be used to clean up all of the nodes modules if you are running into issues. You'd need to then run `npm run bootstrap` again.
3. `npm run build:watch` from the root directory to incrementally transpile the plugin. You probably want this to be continually running while you're working in CEP. This is only rebuilding the CEP itself - if you are changing the code of the `example` app or `example-lib` lib then you'll either need to manually run their build commands, or run them via `npm run bootstrap`.

#### Setup Logging

1. Set an environment variable `TSS_LOG="-logToFile true -file /path/to/lsp_log.log -level verbose"`. Check however your environment or operating system requires environment variables to be set, as it may be different to this.
2. View logs at specified location in a text editor of your choice.

> If you're using VSCode you can view the logs using `TypeScript: Open TS Server log` from the command palette.

The log file contains all of the output from the LSP itself, so it will contain a lot of additional output to the CEP output.
Logs are output from the CEP from `logger.log()` commands, and these are prefixed with the token `[CE]`. An example of this is:
```
Info 277  [13:15:45.841] [CE] diagnosticsUnknownTags: checkTags: invalid-component,banana
```
You can therefore search the file for `[CE]` to filter for CEP output.

> If you are not seeing any matches for `[CE]` but you're seeing the normal output from the LSP, then go towards the front of the file and see if you can find a stack trace or other error message. This is likely caused by a runtime error in the CEP during it initialising.

#### Developing with the Example Application

As mentioned previously, CEP contains an example application in the `/example` directory which can be used as a test project which is setup with the LSP plugin. The approach is based on https://github.com/orta/TypeScript-TSServer-Plugin-Template and https://github.com/microsoft/TypeScript/wiki/Writing-a-Language-Service-Plugin#overview-writing-a-simple-plugin.

`/example` application already contains all of the configuration required for use, as you can see in places like `./example/src/tsconfig.json` which contains configuration for the LSP as described in the [readme](./README.md).

The LSP plugin should be symlinked locally via the `package.json` but if you're having issues you can manually link the plugin:

1. `npm link` in the project root
2. `cd example`
3. `npm link @genesiscommunitysuccess/custom-elements-lsp`

##### Example Library

The directory `/example-lib` contains a small example library which publishes a FAST web component and associated custom elements manifest. It is added as a dependency of the example app already, and then you need to build the output using `npm run build` for use in the example app. If you have run `npm run bootstrap` from the project root then it will have build

#### Developing with another External Project

While working on the LSP plugin you can test it out in any Typescript application you'd like, in addition to testing via the included `/example` application.

1. You need to install the plugin as a dev dependency to your application. You can do this either in a similar way to the `npm link` instructions in the previous section, or use the `file:` syntax for a local installation. For an example of the latter method look at the `example/package.json` file.
2. You need to set up your application as explained in [this section](./README.md#plugin-setup-and-usage). Again, you'll need to do any IDE specific setup such as configuring the `settings.json` of VSCode as explained there.
3. Run the `npm run bootstrap` and `npm run build:watch` commands in the LSP directory as explained previously.


### Testing

Testing is currently only setup for unit tests, but we plan to add some e2e tests in the future too.

```json
{
    "test:unit": "jest",
    "test:unit:coverage": "jest --coverage",
    "test:unit:debug": "node --inspect-brk node_modules/jest/bin/jest.js",
    "test:unit:verbose": "cross-env TEST_LOG=1 jest",
    "test:unit:watch": "jest --watchAll"
}
```
#### Testing Guidelines

* We write test files in the same directory as the file it is testing, with the same name but a `.test.ts` suffix.
* We write test infrastructure files in the `./src/jest/` directory.
* We try and follow the Repository Design Pattern, and use stubbed versions of repositories where possible rather than using jest mocks.
  * See `./src/plugin/custom-elements/repository.ts` and `./src/jest/custom-elements.ts` for examples to understand this.
* Unit testing a private function on a class is OK, by casting it `as any`. Doing this allows you to write more encapsulated unit tests.
* We aim for a high test coverage, but don't put on a hard numerical rule in order to avoid writing useless unit tests just to pass a line count rule.
* Some unit tests require a shape of text input to test which goes against the normal linting rules. That is OK and in this case you should put the test case in `./src/jest/shaped-test-cases.ts` and follow the established pattern.

#### Commands

`test:unit`, `test:unit:coverage` and `test:unit:watch` are simple wrappers around the jest commands. You can call these commands with a string at the end which will filter the tests. For example, if you want to watch unit tests from the `strings.ts` utility file you can run `npm run tset:unit:watch string`.

##### Test Logging

In the unit tests you won't see any logging from the CEP; however, if you use `test:unit:verbose` you will see the logging in the tests.

##### Test Debugging

If you are stuck with a unit test then you can use the node debugger to help. Use the `test:unit:debug` command along with a `debug` statement in your code.

You'll need a front end to use too; This only works with Chromium based browsers. Open your browser and go to `chrome://inspect` and launch the debugger front end from there.

> Note: you still filter the logging and debugging unit tests by filename too.

## Submitting a pull request

If you'd like to contribute by fixing a bug, implementing a feature, or even correcting typos in our documentation,
you'll want to submit a pull request. Before submitting a pull request, be sure to
[rebase](https://www.atlassian.com/git/tutorials/merging-vs-rebasing) your branch (typically from `master`, which is our
main branch). Please note we currently use [Github Flow](https://docs.github.com/en/get-started/quickstart/github-flow), merging strategy.

#### PR checklist

A few simple guidelines for release automation to run smoothly:

##### 1. Squash & merge

- Single commit representing each change making it easy to revert/cherry-pick if needed
- Clean Git history (no merge or WIP commits)

![](docs/images/squash-and-merge.png)

##### 2. PR title should be a valid conventional commit message (validated by Github action)

Commit message title is used in release notes. Commit message body isn’t included (it’s still visible in Git history). JIRA Ref, PR number and Git commit are clickable links providing more context.

PR Title should contain the ticket prefix as appropriate.
* Internal Genesis employees should be using `FUI-` as their ticket.
* External contributions should link to an issue on GitHub, and use `ISSUE-` as their tickets.

![](docs/images/release-notes.png)

##### 3. Use correct conventional commit type (chore/fix/feat/breaking change)

- It’s **critical that correct conventional commit category is specified,** particularly flagging up any breaking changes.
    - If in doubt, reach out to others
    - If you’re a reviewer on a PR, double-check that it has the correct category
    - As a rule of thumb:
        - Bugfix: existing functionality fixed to behave correctly. User doesn’t need to do anything.
        - Feature: new functionality. User needs to make changes to make use of the new APIs.
        - Breaking change: user needs to perform steps to upgrade (they need to change an existing setting in `tsconfig.json` for example).
        - Chore: anything else. User doesn’t need to do anything.
- It’s from the point of view of public API / end-user
    - If you introduce a bugfix/feature/breaking change, which isn’t exposed to the user in any way (either because it’s private API or it’s in supporting code such as test helpers), then it counts as a chore.

### Default Branch

The `master` branch is the _default_ branch. It cannot be pushed to directly and will be pre-selected when you raise a PR.
We do not use a develop branch. `master` is used for all releases pinned to the current major version. Pull requests
should be merged directly into this branch so that they can be automatically checked for publishing.

### Development Branches

To contribute a feature, bugfix etc, please create a working branch off master using your Github username and some contextual detail. For example:

The format should be `<github-user>/<ticket-name>-<short-description>`.

```shell
git checkout master
git pull
git checkout -b matteematt/issue-2-fix-diagnostics
```

As explained in the PR title section, ticket names are dependent on whether you are an internal or external contributor.

### Commit Messages

We follow [conventional commits](https://www.conventionalcommits.org) in CEP, and have commit linting in place when you attempt to push. Please do not bypass these hooks as your PR will be rejected by reviewers. If you are unfamiliar with conventional commits please read the conventional commits spec and see the project's git log for examples.

You can validate any commit message using `commitlint` task (including multiline messages):

```
⧗   input: fix: Desc
✖   subject must not be sentence-case, start-case, pascal-case, upper-case [subject-case]
✖   references may not be empty [references-empty]

✖   found 2 problems, 0 warnings
```

Fix issues and re-run:
```
> node ./src/scripts/commitlint.js fix: desc ISSUE-1

⧗   input: fix: desc ISSUE-1
✔   Commitlint check successful``
```

Our [commitlint configuration](./src/scripts/commitlint.js) is setup to use ticket prefixes are required.

Here's an example of a fix, which correlates with PATCH in [Semantic Versioning](https://semver.org/):

```text
fix: attribute diagnostics where attributes are substrings of others FUI-1416
```

Here's an example of a feature added, which correlates with MINOR in [Semantic Versioning](https://semver.org/):

```text
feat: diagnostics support for non-custom elements FUI-1227
```

Here's an example of a breaking change  with a verbose commit message. It's a feature with a breaking change as indicated by a footer for extra visibility. This correlates with MAJOR in [Semantic Versioning](https://semver.org/):

```text
feat: continuously analyse source code to update custom elements manifest ISSUE-3

BREAKING CHANGE: Changed required config in tsconfig.json to set src and dependencies config in a parser block.
```

> If you are addressing multiple issues which are unrelated, consider either doing multiple pull requests, or doing separate scoped commits to ensure accurate generation of changelogs and versioning of packages.

> *IMPORTANT*: If you are finding that your changes are either breaking changes or require multiple pull requests, open a discussion to discuss this. We want to avoid breaking changes.

### Pull Request Formatting

All pull requests should use the primary commit message as the title and our [PR template](./.github/pull_request_template.md) which is added to the PR by default. Please add the ticket number to the end of the PR title if not present. Please complete all the relevant sections to the best of your ability as failure to do so may result in PR rejection.

### Pull Request Merging

For the time being, only core CEP maintainers will have the necessary security privileges to merge pull requests. When merging a branch to the default `master` branch, **changes should be squashed**:

It is critical to retain all the conventional commit information, as some of these commit messages may detail breaking changes etc, the severity of which will dictate the [Semantic Versioning](https://semver.org/) required for the package.

## Stability policy

An essential consideration in every pull request is its impact on the system. To manage impacts, we work collectively to ensure that we do not introduce unnecessary breaking changes, performance or functional regressions, or negative impacts on usability for users or supported partners.

