# Maintain the documentation website

The website builds from the same Markdown you review in the repository. Edit the guide that owns a topic and link to it from other pages.

## Build and preview

From the repository root, use Python 3.12 and Node.js 24.

```bash
python -m pip install -r requirements-docs.txt
node tools/check-docs.cjs
python tools/build_docs_site.py
python -m http.server 8000 --directory site
```

Open [the local preview](http://localhost:8000/). Rerun the builder after editing the Markdown or styles. The builder stages Markdown in `.docs-source` and writes HTML to `site`.

## Edit content and navigation

- Start with the [documentation index](../README.md) when deciding where a topic belongs.
- Edit the page in place. Add a relative link to its source path and keep examples beside the instructions that need them.
- Add reviewed public guides to the navigation in `mkdocs.yml`. The build publishes only pages listed there and rejects links to unpublished Markdown.
- Update [the landing page](../../website/index.md) when a workflow needs a different entry point.
- Source links outside the site point to the same Git revision on GitHub.

Use admonitions for operational details readers might miss.

```markdown
!!! note "Verify the active view"
    Check that the widget is connected to the Map widget you are testing.
```

## Deploy on GitHub Pages

In the destination repository, set **Settings → Pages → Source** to **GitHub Actions**. The [documentation workflow](../../.github/workflows/documentation.yml) builds on pull requests and pushes. It deploys from the repository's default branch using the base URL reported by GitHub Pages.

After deployment, open the Pages URL from the workflow and check navigation, search, theme switching, code copy, and a narrow screen. The workflow publishes documentation independently of the widget build.
