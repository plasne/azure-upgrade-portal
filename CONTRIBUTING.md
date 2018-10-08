# Contributing

We love pull requests from everyone. By participating in this project, you
agree to abide by the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).

## Microsoft Employees

-   Contact Peter Lasne to be added as a Contributor on this project.

-   To experiment, create a branch like "_alias_/working".

-   For features or bug fix, create a branch like "staging/_feature_".

-   For release, create a branch like "release/_name or version_".

## Outside Microsoft

-   Fork then clone the repo.

-   Make tests for all your changes.

-   Make sure your tests pass.

-   Push to your fork and submit a pull request.

## Commits

-   We will be supporting a non-linear commit history.

```
  A---B---C topic
 /         \
D---E---F---G---H master

git fetch origin
git checkout master
git merge topic
```

-   Please make sure your commit history contains WHAT and WHY (not HOW).

-   Please comment per these guidelines: http://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html.

Fork, then clone the repo

Make sure the tests pass

Make your change. Add tests for your change. Make the tests pass

Push to your fork and [submit a pull request][pr].

[pr]: https://github.com/xyz

At this point you're waiting on us. We like to at least comment on pull requests
within three business days (and, typically, one business day). We may suggest
some changes or improvements or alternatives.

Some things that will increase the chance that your pull request is accepted:

-   Write tests.
-   Follow our [engineering playbook][playbook] and the [style guide][style] for this project.
-   Write a [good commit message][commit].

[playbook]: https://github.com/cloudbeatsch/code-with-engineering-playbook
[style]: https://github.com/xyz
[commit]: http://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html
