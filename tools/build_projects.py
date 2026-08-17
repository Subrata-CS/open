#!/usr/bin/env python3
"""
build_projects.py — turn the projects/ folder into the Projects page.

    cd tools && python build_projects.py

One Markdown file per group, and one line per project. A line is a topic name
and a link; the note after the dash is optional, so the smallest useful entry
really is two things.

    ---
    title: Systems and low level
    about: Build the thing under the thing.
    order: 2
    ---

    - [Nand2Tetris](https://www.nand2tetris.org/)
    - [Crafting Interpreters](https://craftinginterpreters.com/) — two complete languages.

  title  heading for the group          (required — falls back to the filename)
  about  one line under the heading     (optional)
  order  where the group sits           (optional, default 99)

Duplicate links are dropped so the same project cannot be listed twice.
"""
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(ROOT)
SRC = os.path.join(REPO, "projects")
OUT = os.path.join(REPO, "src", "data", "projects.json")

FRONT = re.compile(r"^---\s*\n(.*?)\n---\s*\n", re.S)
LINK = re.compile(r"^\s*[-*]\s*\[([^\]]+)\]\((https?://[^)\s]+)\)\s*(?:[—–-]\s*(.*))?$")


def parse(path):
    with open(path, encoding="utf-8") as f:
        raw = f.read()

    meta, body = {}, raw
    m = FRONT.match(raw)
    if m:
        for line in m.group(1).split("\n"):
            if ":" in line:
                k, _, value = line.partition(":")
                meta[k.strip().lower()] = value.strip().strip("\"'")
        body = raw[m.end():]

    links = []
    for line in body.split("\n"):
        hit = LINK.match(line)
        if hit:
            links.append(
                {
                    "name": hit.group(1).strip(),
                    "url": hit.group(2).strip(),
                    "about": (hit.group(3) or "").strip().rstrip("."),
                }
            )
    return meta, links


def main():
    if not os.path.isdir(SRC):
        print(f"No {SRC}/ folder — nothing to build.")
        return

    groups = []
    seen = {}
    dropped = 0

    for name in sorted(os.listdir(SRC)):
        if not name.endswith((".md", ".markdown")):
            continue
        meta, links = parse(os.path.join(SRC, name))

        unique = []
        for link in links:
            k = link["url"].rstrip("/").lower()
            if k in seen:
                print(f"  duplicate: {link['name'][:28]:28} already in {seen[k]}", file=sys.stderr)
                dropped += 1
                continue
            seen[k] = name
            unique.append(link)

        if not unique:
            continue

        stem = os.path.splitext(name)[0]
        groups.append(
            {
                "id": stem,
                "title": meta.get("title") or stem.replace("-", " ").title(),
                "about": meta.get("about", ""),
                "order": int(meta.get("order", 99) or 99),
                "file": f"projects/{name}",
                "links": unique,
            }
        )

    groups.sort(key=lambda g: (g["order"], g["title"]))

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(groups, f, indent=1, ensure_ascii=False)
        f.write("\n")

    total = sum(len(g["links"]) for g in groups)
    print(f"Groups   : {len(groups)}")
    print(f"Projects : {total}")
    if dropped:
        print(f"Duplicates: {dropped} dropped")
    for g in groups:
        print(f"  {g['order']:>3}  {g['title'][:32]:34} {len(g['links'])}")


if __name__ == "__main__":
    try:
        main()
    except BrokenPipeError:
        os._exit(0)
