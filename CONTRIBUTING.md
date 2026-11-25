# Contributing

This is a React/TypeScript widget hosted by ArcGIS Experience Builder Developer Edition. The existing development target is 1.20; the 1.21 setup uses pnpm and still needs full host/SDK acceptance. Use the host's supported Node/dependency versions and build pipeline; there is no standalone widget package manifest. Keep SDK/browser acceptance separate from portable unit checks. Follow the [version-specific installation guide](docs/installation.md) before running the host.

## Your first contribution

1. Pick a problem you can reproduce or a guide you can follow and improve. Search existing issues and pull requests. Leave a short note on an existing issue if you intend to work on it. For a broad change, describe your approach before implementing it.
2. Fork and clone the repository. From your clone, create a focused branch with `git switch -c docs/clarify-first-launch` or a name that describes your change. Follow the [host setup](docs/installation.md) for runtime work. Markdown-only changes can run the documentation checker with Node.js.
3. Follow the surrounding code's conventions. Keep widget dependencies in the host, and test the affected workflow. Preserve keyboard access and translate new user-facing strings through the existing catalogs. [Translation guide](docs/localization/CONTRIBUTING.md)
4. Commit with a short description such as `docs: clarify first launch`. Push your branch and open a pull request against the target repository. Describe the user impact, link the issue, and include what you ran and what still needs host verification.
5. A reviewer may request a smaller diff, clearer evidence, or a follow-up change. Reply in the pull request and update the same branch. Maintain the discussion in one place so later contributors can follow the decision.

[Support and reporting](SUPPORT.md) · [Community standards](CODE_OF_CONDUCT.md) · [Security reporting](SECURITY.md)

## Development and checks

- [Documentation index](docs/README.md)
- [Architecture](docs/development/architecture.md) and [roadmap](docs/development/roadmap.md)
- [Places tests](docs/development/places-testing.md)
- [Localization contributions](docs/localization/CONTRIBUTING.md)

Run affected Node suites with `node --test tests/<suite>.test.cjs`. The lightweight TypeScript loaders resolve the host's `typescript`, or the module path supplied through `MAPILLARY_TYPESCRIPT`. React/DOM suites additionally need compatible React, React DOM and jsdom available from the environment. Browser suites need their documented browser harness/dependencies. Python export tests need `tools/overture_places/requirements.txt`; serving uses standard-library Python.

For an explicit complete Node run and dependency preflight, use the [portable test environment guide](docs/development/portable-tests.md). Test dependencies stay outside the runtime/host when needed; the runner does not suppress existing failures.

Maintained check entry points:

```sh
node tools/check-portable-tests.cjs --client "C:\path\to\experience-builder\client" --preflight
node tools/check-repository.cjs
node tools/check-docs.cjs
node tools/check-localization-catalogs.cjs
node tools/translation-table.cjs check docs/localization/translations.csv
node tools/test-interaction-ux.cjs
python tests/overtureAllPlacesExport.test.py
python tests/overturePlacesLocal.test.py
```

Check the changed feature's tests, TypeScript/TSX syntax and the full host build when available. For moves, update imports, documentation links, commands and regression fixtures together. Keep useful tests of cancellation, bounded work, selection identity and attachment/save boundaries. Do not add local backup directories, Python caches, environments or generated regional datasets to Git.

Prefer current task-based guides to patch-by-patch delivery notes. Historical evidence belongs in `docs/history/` only when it explains a continuing design decision. Database migrations in `tools/community-notes/migrations/` remain operational assets; they are not disposable patch installers.

See the [repository layout and baseline](docs/development/repository-baseline.md) for source ownership, packaging boundaries and remaining publication checks.
