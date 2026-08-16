#!/usr/bin/env python3
"""
build_platforms.py — turn the platforms/ folder into the Practice page.

    cd tools && python build_platforms.py

One Markdown file per category. Write a list of links, run this, and they are
on the site. Nothing else to edit.

    ---
    title: DSA and interviews
    about: Where to grind problems until the patterns are automatic.
    order: 3
    ---

    - [LeetCode](https://leetcode.com/) — the interview standard, by volume.
    - [NeetCode](https://neetcode.io/) — LeetCode, but ordered by pattern.

  title  heading for the group          (required — falls back to the filename)
  about  one line under the heading     (optional)
  order  where the group sits           (optional, default 99)

Each list item is `- [Name](url)` with an optional description after an em
dash or a hyphen. Anything that is not a link line is ignored, so you can keep
notes in the file.
"""
import json
import os
import re

ROOT = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(ROOT)
SRC = os.path.join(REPO, "platforms")
OUT = os.path.join(REPO, "src", "data", "platforms.json")

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
                key, _, value = line.partition(":")
                meta[key.strip().lower()] = value.strip().strip("\"'")
        body = raw[m.end():]

    links = []
    for line in body.split("\n"):
        hit = LINK.match(line)
        if hit:
            links.append(
                {
                    "name": hit.group(1).strip(),
                    "url": hit.group(2).strip(),
                    "about": (hit.group(3) or "").strip(),
                }
            )
    return meta, links


def main():
    os.makedirs(SRC, exist_ok=True)
    groups = []

    for name in sorted(os.listdir(SRC)):
        if not name.endswith((".md", ".markdown")):
            continue
        meta, links = parse(os.path.join(SRC, name))
        if not links:
            continue
        stem = os.path.splitext(name)[0]
        groups.append(
            {
                "id": stem,
                "title": meta.get("title") or stem.replace("-", " ").title(),
                "about": meta.get("about", ""),
                "order": int(meta.get("order", 99) or 99),
                "file": f"platforms/{name}",
                "links": links,
            }
        )

    groups.sort(key=lambda g: (g["order"], g["title"]))

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(groups, f, indent=1, ensure_ascii=False)
        f.write("\n")

    total = sum(len(g["links"]) for g in groups)
    print(f"Groups : {len(groups)}")
    print(f"Links  : {total}")
    for g in groups:
        print(f"  {g['order']:>3}  {g['title'][:30]:32} {len(g['links'])}")


if __name__ == "__main__":
    try:
        main()
    except BrokenPipeError:
        # output was piped into something that closed early, e.g. `| head`
        os._exit(0)
