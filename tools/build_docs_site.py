#!/usr/bin/env python3
"""Build the site from repository Markdown while keeping file paths meaningful."""
import argparse
import os
from pathlib import Path
import posixpath
import re
import shutil
import subprocess
from urllib.parse import quote, unquote, urlsplit, urlunsplit

from mkdocs.commands.build import build
from mkdocs.config import load_config

ROOT = Path(__file__).resolve().parents[1]
STAGED = ROOT / ".docs-source"
README = "README.md"
LINK = re.compile(r"(?P<open>\]\(\s*)(?P<url><[^>\n]+>|[^\s)]+)")
FENCE = re.compile(r"^ *(?:> *)?(`{3,}|~{3,})")
INLINE_CODE = re.compile(r"(?<!`)(`+).*?\1(?!`)")


def git(*args):
    return subprocess.check_output(["git", "-C", str(ROOT), *args], text=True).strip()


def repository():
    if name := os.environ.get("GITHUB_REPOSITORY"):
        return name
    origin = git("remote", "get-url", "origin")
    match = re.search(r"github\.com[:/]([^/]+/[^/]+?)(?:\.git)?/?$", origin)
    if not match:
        raise SystemExit("Set GITHUB_REPOSITORY to the GitHub owner and repository.")
    return match[1]


def rewrite_source_links(markdown, source, dest, published, repo, ref):
    def replace(match):
        target = match["url"].strip("<>")
        parsed = urlsplit(target)
        if not parsed.path or parsed.scheme or parsed.netloc or target.startswith("/"):
            return match[0]
        resolved = posixpath.normpath(posixpath.join(posixpath.dirname(source), unquote(parsed.path)))
        if resolved in published:
            address = posixpath.relpath(published[resolved], posixpath.dirname(dest) or ".")
        elif resolved == README:
            address = posixpath.relpath("index.md", posixpath.dirname(dest) or ".")
        elif resolved.lower().endswith(".md"):
            raise ValueError(f"{source} links to an unpublished document: {resolved}")
        else:
            location = ROOT / resolved
            if not location.resolve().is_relative_to(ROOT) or not location.exists():
                return match[0]
            address = f"https://github.com/{repo}/{'tree' if location.is_dir() else 'blob'}/{ref}/{quote(resolved)}"
        parts = urlsplit(address)
        return match["open"] + urlunsplit(parts._replace(query=parsed.query, fragment=parsed.fragment))

    lines = []
    fence = None
    for line in markdown.splitlines(keepends=True):
        marker = FENCE.match(line)
        if marker:
            chars = marker[1]
            if fence and chars[0] == fence[0] and len(chars) >= len(fence):
                fence = None
            elif not fence:
                fence = chars
            lines.append(line)
        elif fence:
            lines.append(line)
        else:
            cursor = 0
            for span in INLINE_CODE.finditer(line):
                lines.append(LINK.sub(replace, line[cursor:span.start()]))
                lines.append(span[0])
                cursor = span.end()
            lines.append(LINK.sub(replace, line[cursor:]))
    return "".join(lines)


def nav_paths(entries):
    for entry in entries:
        if isinstance(entry, str):
            yield entry
        elif isinstance(entry, dict):
            for value in entry.values():
                yield from nav_paths([value])
        elif isinstance(entry, list):
            yield from nav_paths(entry)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--site-url", default=os.environ.get("DOCS_SITE_URL"))
    parser.add_argument("--output", type=Path, default=ROOT / "site")
    options = parser.parse_args()
    output = options.output.resolve()
    for protected in (ROOT, ROOT / "docs", ROOT / "src", ROOT / "tools", ROOT / "website", STAGED):
        if protected.is_relative_to(output) or (protected != ROOT and output.is_relative_to(protected)):
            parser.error("--output must point to a separate generated-site directory.")
    if output.is_dir() and any(output.iterdir()) and not (output / ".generated-docs-site").is_file():
        parser.error("--output points to a nonempty directory without the generated-site marker.")
    repo = repository()
    ref = os.environ.get("GITHUB_SHA") or git("rev-parse", "HEAD")
    if STAGED.exists():
        if not (STAGED / ".generated").is_file():
            raise SystemExit(f"Refusing to replace existing directory {STAGED}.")
        shutil.rmtree(STAGED)
    STAGED.mkdir()
    (STAGED / ".generated").touch()
    settings = load_config(config_file=str(ROOT / "mkdocs.yml"), site_dir=str(output),
                           site_url=options.site_url or "http://localhost:8000/",
                           repo_url=f"https://github.com/{repo}", repo_name=repo)
    published = {name: name for name in nav_paths(settings.nav) if name != "index.md"}
    published["website/index.md"] = "index.md"
    for source, dest in published.items():
        text = (ROOT / source).read_text(encoding="utf-8-sig")
        text = rewrite_source_links(text, source, dest, published, repo, ref)
        target = STAGED / dest
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(text, encoding="utf-8")
    shutil.copytree(ROOT / "website/assets", STAGED / "assets")
    shutil.copy2(ROOT / "logo.png", STAGED / "assets/logo.png")
    build(settings)
    (output / ".generated-docs-site").touch()
    print(f"Built {len(published)} documentation pages at {output}.")


if __name__ == "__main__":
    main()
