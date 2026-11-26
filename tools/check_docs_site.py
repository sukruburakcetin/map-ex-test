#!/usr/bin/env python3
"""Check the generated site's navigation, assets, anchors, and search index."""
import argparse
from html.parser import HTMLParser
import json
import os
from pathlib import Path
from urllib.parse import unquote, urljoin, urlsplit


class Page(HTMLParser):
    def __init__(self, file):
        super().__init__()
        self.anchors = set()
        self.links = set()
        self.feed(file.read_text(encoding="utf-8"))

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if attrs.get("id"):
            self.anchors.add(attrs["id"])
        if tag == "a" and attrs.get("name"):
            self.anchors.add(attrs["name"])
        attr = "href" if tag in ("a", "link") else "src" if tag in ("img", "script") else None
        if attr and attrs.get(attr):
            self.links.add(attrs[attr])


def main():
    args = argparse.ArgumentParser(description=__doc__)
    args.add_argument("--site-dir", type=Path, default=Path("site"))
    args.add_argument("--site-url", default=os.environ.get("DOCS_SITE_URL") or "http://localhost:8000/")
    options = args.parse_args()
    root = options.site_dir.resolve()
    base = urlsplit(options.site_url.rstrip("/") + "/")
    pages = {file: Page(file) for file in root.rglob("*.html")}
    errors = set()

    def target(location):
        url = urlsplit(location)
        if (url.scheme, url.netloc) != (base.scheme, base.netloc):
            return None, ""
        if not url.path.startswith(base.path):
            return root / ".outside-site", ""
        name = root / unquote(url.path[len(base.path):])
        return (name / "index.html" if name.is_dir() else name), unquote(url.fragment)

    excluded_paths = (
        "docs/history/",
        "docs/development/architecture/",
        "docs/releases/5.0-change-inventory/",
        "docs/releases/5.0-draft/",
    )

    checked = 0
    for file, page in pages.items():
        relative = file.relative_to(root).as_posix()
        if relative.startswith(excluded_paths):
            errors.add(f"Unpublished page in site output: {relative}")
        if relative == "404.html":
            continue
        url = urljoin(base.geturl(), relative.removesuffix("index.html"))
        for link in page.links:
            address = urljoin(url, link)
            if any(section in urlsplit(address).path for section in excluded_paths):
                errors.add(f"{relative}: link to unpublished material {link}")
            dest, fragment = target(address)
            if dest is None:
                continue
            checked += 1
            if not dest.is_file():
                errors.add(f"{relative}: missing {link}")
            elif fragment and dest in pages and fragment not in pages[dest].anchors:
                errors.add(f"{relative}: missing anchor {link}")

    if root / "index.html" not in pages:
        errors.add("Missing site homepage.")
    content = json.loads((root / "search/search_index.json").read_text(encoding="utf-8"))
    terms = ("Time travel preview and comparison", "External Places service contract", "Install Mapillary Explorer")
    searchable = " ".join(entry.get("title", "") for entry in content["docs"])
    for term in terms:
        if term not in searchable:
            errors.add(f"Missing search title: {term}")
    for result in content["docs"]:
        dest, fragment = target(urljoin(base.geturl(), result["location"]))
        if dest not in pages or (fragment and fragment not in pages[dest].anchors):
            errors.add(f"Search result is not reachable: {result['location']}")

    print(f"{len(pages)} HTML pages, {checked} internal links and assets, {len(content['docs'])} search entries.")
    if errors:
        raise SystemExit("\n".join(sorted(errors)))


if __name__ == "__main__":
    main()
