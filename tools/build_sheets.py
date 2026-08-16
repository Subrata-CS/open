#!/usr/bin/env python3
"""
build_sheets.py — turn the sheets/ folder into the Cheat Sheets page.

    cd tools && python build_sheets.py

Write a Markdown file, drop it in sheets/, run this, and it is on the site.
There is no registry to edit and no limit on how many you add.

Each file starts with a small front matter block, exactly like a Docusaurus
page:

    ---
    title: Git
    group: Version control
    about: The twenty commands that cover almost every day.
    tags: git, branches, remotes
    ---

    ## Starting out

    | Command | What it does |
    |---|---|
    | `git init` | start a repository here |

  title  what the reader sees in the list   (required — falls back to the filename)
  group  used to group the list             (optional, default "General")
  about  one line of context                (optional)
  tags   comma separated, used by search    (optional)

Everything after the front matter is ordinary Markdown: headings, lists,
tables, code blocks, links. It is rendered on the page as written.
"""
import json
import os
import re

ROOT = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(ROOT)
SHEETS = os.path.join(REPO, "sheets")
OUT = os.path.join(REPO, "src", "data", "sheets.json")

FRONT = re.compile(r"^---\s*\n(.*?)\n---\s*\n", re.S)


def parse(path):
    with open(path, encoding="utf-8") as f:
        raw = f.read()

    meta = {}
    body = raw

    m = FRONT.match(raw)
    if m:
        for line in m.group(1).split("\n"):
            if ":" not in line:
                continue
            key, _, value = line.partition(":")
            meta[key.strip().lower()] = value.strip().strip("\"'")
        body = raw[m.end():]

    return meta, body.strip() + "\n"


def main():
    os.makedirs(SHEETS, exist_ok=True)
    sheets = []

    for name in sorted(os.listdir(SHEETS)):
        if not name.endswith((".md", ".markdown")):
            continue
        path = os.path.join(SHEETS, name)
        meta, body = parse(path)
        stem = os.path.splitext(name)[0]

        sheets.append(
            {
                "id": stem,
                "title": meta.get("title") or stem.replace("-", " ").title(),
                "group": meta.get("group") or "General",
                "about": meta.get("about", ""),
                "tags": [t.strip() for t in meta.get("tags", "").split(",") if t.strip()],
                "file": f"sheets/{name}",
                "body": body,
            }
        )

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(sheets, f, indent=1, ensure_ascii=False)
        f.write("\n")

    groups = {}
    for s in sheets:
        groups[s["group"]] = groups.get(s["group"], 0) + 1
    print(f"Cheat sheets : {len(sheets)}")
    for group, n in sorted(groups.items()):
        print(f"  {group:22} {n}")


if __name__ == "__main__":
    try:
        main()
    except BrokenPipeError:
        # output was piped into something that closed early, e.g. `| head`
        os._exit(0)
