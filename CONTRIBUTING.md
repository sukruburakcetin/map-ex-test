# Contributing

This is a React/TypeScript widget hosted by ArcGIS Experience Builder Developer Edition 1.20. Use the host's supported Node/dependency versions and build pipeline; there is no standalone widget package manifest. Keep SDK/browser acceptance separate from portable unit checks.

- [Documentation index](docs/README.md)
- [Architecture](docs/development/architecture.md) and [roadmap](docs/development/roadmap.md)
- [Places tests](docs/development/places-testing.md)
- [Localization contributions](docs/localization/CONTRIBUTING.md)

Run affected Node suites with `node --test tests/<suite>.test.cjs`. The lightweight TypeScript loaders resolve the host's `typescript`, or the module path supplied through `MAPILLARY_TYPESCRIPT`. React/DOM suites additionally need compatible React, React DOM and jsdom available from the environment. Browser suites need their documented browser harness/dependencies. Python export tests need `tools/overture_places/requirements.txt`; serving uses standard-library Python.

Maintained check entry points:

```sh
node tools/check-docs.cjs
node tools/check-localization-catalogs.cjs
node tools/translation-table.cjs check docs/localization/translations.csv
node tools/test-interaction-ux.cjs
python tests/overtureAllPlacesExport.test.py
python tests/overturePlacesLocal.test.py
```

Check the changed feature's tests, TypeScript/TSX syntax and the full host build when available. For moves, update imports, documentation links, commands and regression fixtures together. Keep useful tests of cancellation, bounded work, selection identity and attachment/save boundaries. Do not add local backup directories, Python caches, environments or generated regional datasets to Git.

Prefer current task-based guides to patch-by-patch delivery notes. Historical evidence belongs in `docs/history/` only when it explains a continuing design decision. Database migrations in `tools/community-notes/migrations/` remain operational assets; they are not disposable patch installers.
